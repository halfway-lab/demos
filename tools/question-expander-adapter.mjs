import http from 'node:http'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { mockExpandPaths, mockExpandSubPaths, mockExpandPathsByLevel } from '../demos/question-expander/src/mock/hwpPaths.js'

const PORT = Number(process.env.HWP_DEMO_PORT || 3000)
const HOST = process.env.HWP_DEMO_HOST || '127.0.0.1'
const PROVIDER = process.env.HWP_DEMO_PROVIDER || 'mock'
const COMMAND = process.env.HWP_DEMO_COMMAND || ''
const HWP_REPLAY_CHAIN_PATH = process.env.HWP_REPLAY_CHAIN_PATH || ''
const HWP_LLM_MODEL = process.env.HWP_LLM_MODEL || ''
const HWP_LLM_API_KEY = process.env.HWP_LLM_API_KEY || process.env.OPENAI_API_KEY || ''
const TOOLS_DIR = dirname(fileURLToPath(import.meta.url))
const HWP_OPENAI_COMPAT_AGENT = join(TOOLS_DIR, 'hwp-openai-compatible-agent.mjs')
const HWP_REPO_PATH = resolveHwpRepoPath()

function resolveHwpRepoPath() {
  const candidates = [
    process.env.HWP_REPO_PATH,
    join(TOOLS_DIR, '..', '..', '..', 'protocol', 'HWP')
  ].filter(Boolean)

  return candidates.find(candidate => existsSync(candidate)) || candidates[0]
}

const BRANCH_TYPES_BY_LEVEL = {
  1: ['premise_shift', 'hidden_variable', 'unfinished_path'],
  2: ['premise_deconstruction', 'variable_relational', 'path_meta'],
  3: ['deep_action', 'deep_obstacle', 'deep_resource', 'deep_feedback'],
  4: ['exec_step', 'exec_metric', 'exec_risk', 'exec_support']
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2)
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
  })
  res.end(body)
}

function getLiveProviderMode() {
  if (HWP_REPLAY_CHAIN_PATH) return 'replay'
  if (COMMAND) return 'command'
  if (HWP_LLM_MODEL && HWP_LLM_API_KEY) return 'live_llm'
  return PROVIDER
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = ''

    req.on('data', chunk => {
      raw += chunk
    })

    req.on('end', () => {
      if (!raw.trim()) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(raw))
      } catch (error) {
        reject(new Error('Invalid JSON body'))
      }
    })

    req.on('error', reject)
  })
}

function normalizePath(rawPath, fallbackId, level) {
  return {
    id: rawPath.id ?? fallbackId,
    path_title: rawPath.path_title ?? rawPath.title ?? '未命名路径',
    path_summary: rawPath.path_summary ?? rawPath.summary ?? '',
    next_question: rawPath.next_question ?? rawPath.nextQuestion ?? '',
    branch_type: rawPath.branch_type ?? rawPath.branchType ?? 'unknown',
    unfinished_score: typeof rawPath.unfinished_score === 'number'
      ? rawPath.unfinished_score
      : typeof rawPath.unfinishedScore === 'number'
        ? rawPath.unfinishedScore
        : 0.5,
    blind_spot_hint: rawPath.blind_spot_hint ?? rawPath.blindSpotHint ?? '',
    level,
    created_at: rawPath.created_at ?? rawPath.createdAt ?? new Date().toISOString()
  }
}

function normalizePaths(payload, level, parentId = 'root') {
  const list = Array.isArray(payload) ? payload : payload?.paths

  if (!Array.isArray(list)) {
    throw new Error('Adapter provider must return an array or an object with a paths array')
  }

  return list.map((item, index) => normalizePath(item, `${parentId}-${level}-${index + 1}`, level))
}

async function runMockProvider(payload) {
  if (payload.depth === 2) {
    const rawPaths = await mockExpandSubPaths(payload.parent_path_id, payload.context?.parent_title || '未命名路径')
    return normalizePaths(rawPaths, 2, payload.parent_path_id)
  }

  if (payload.depth > 2) {
    const rawPaths = await mockExpandPathsByLevel(
      payload.parent_path_id,
      payload.context?.parent_title || '未命名路径',
      payload.depth
    )
    return normalizePaths(rawPaths, payload.depth, payload.parent_path_id)
  }

  const rawPaths = await mockExpandPaths(payload.question || '')
  return normalizePaths(rawPaths, 1, 'root')
}

async function runCommandProvider(payload) {
  if (!COMMAND) {
    throw new Error('HWP_DEMO_COMMAND is required when HWP_DEMO_PROVIDER=command')
  }

  return new Promise((resolve, reject) => {
    const child = spawn(COMMAND, {
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', chunk => {
      stdout += chunk.toString()
    })

    child.stderr.on('data', chunk => {
      stderr += chunk.toString()
    })

    child.on('error', reject)

    child.on('close', code => {
      if (code !== 0) {
        reject(new Error(`Command provider exited with code ${code}: ${stderr.trim()}`))
        return
      }

      try {
        const parsed = JSON.parse(stdout)
        resolve(normalizePaths(parsed, payload.depth || 1, payload.parent_path_id || 'root'))
      } catch (error) {
        reject(new Error(`Command provider returned invalid JSON: ${error.message}`))
      }
    })

    child.stdin.write(JSON.stringify(payload))
    child.stdin.end()
  })
}

async function getLatestChainLog(repoPath) {
  const logsPath = join(repoPath, 'logs')
  const entries = await readdir(logsPath)
  const chainLogs = entries
    .filter(entry => entry.startsWith('chain_hwp_') && entry.endsWith('.jsonl'))
    .sort()

  return chainLogs.length > 0 ? join(logsPath, chainLogs[chainLogs.length - 1]) : null
}

async function runHwpRunner(inputText) {
  const repoPath = HWP_REPO_PATH
  const tmpDir = await mkdtemp(join(tmpdir(), 'hwp-demo-'))
  const inputFile = join(tmpDir, 'input.txt')
  const beforeLatest = await getLatestChainLog(repoPath)

  await writeFile(inputFile, `${inputText}\n`, 'utf8')

  const env = {
    ...process.env,
    HWP_ROUND_SLEEP_SEC: process.env.HWP_ROUND_SLEEP_SEC || '0'
  }

  if (HWP_REPLAY_CHAIN_PATH) {
    env.HWP_REPLAY_CHAIN_PATH = HWP_REPLAY_CHAIN_PATH
  } else if (!env.HWP_AGENT_CMD && HWP_LLM_MODEL && HWP_LLM_API_KEY) {
    env.HWP_AGENT_CMD = `node ${shellEscape(HWP_OPENAI_COMPAT_AGENT)}`
  }

  try {
    await new Promise((resolve, reject) => {
      const child = spawn('bash', ['runs/run_sequential.sh', inputFile], {
        cwd: repoPath,
        env,
        stdio: ['ignore', 'pipe', 'pipe']
      })

      let stderr = ''

      child.stderr.on('data', chunk => {
        stderr += chunk.toString()
      })

      child.on('error', reject)
      child.on('close', code => {
        if (code !== 0) {
          reject(new Error(`HWP runner exited with code ${code}: ${stderr.trim()}`))
          return
        }
        resolve()
      })
    })

    const afterLatest = await getLatestChainLog(repoPath)
    if (!afterLatest || afterLatest === beforeLatest) {
      throw new Error('HWP runner finished but no new chain log was detected')
    }

    const logText = await readFile(afterLatest, 'utf8')
    const lines = logText.trim().split('\n').filter(Boolean)
    if (lines.length === 0) {
      throw new Error(`HWP runner produced an empty chain log: ${afterLatest}`)
    }

    const outer = JSON.parse(lines[lines.length - 1])
    const innerText = outer?.payloads?.[0]?.text
    if (!innerText) {
      throw new Error('Latest HWP result did not contain payloads[0].text')
    }

    return JSON.parse(innerText)
  } finally {
    await rm(tmpDir, { recursive: true, force: true })
  }
}

function shellEscape(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`
}

function makeFallbackPaths(payload, message) {
  const level = Math.max(1, Number(payload.depth) || 1)
  const topic = payload.question || payload.context?.parent_title || '当前问题'
  return [
    normalizePath({
      id: `${payload.parent_path_id || 'fallback'}-${level}-1`,
      path_title: level === 1 ? '暂时降级为保护性展开' : `第${level}层保护性展开`,
      path_summary: `真实 provider 本轮未能返回有效结构，已使用保护性回退结果保持 demo 可继续操作。原因：${message}`,
      next_question: `围绕「${topic}」，当前最值得先澄清的前提是什么？`,
      branch_type: 'fallback',
      unfinished_score: 0.66,
      blind_spot_hint: '当前轮次触发了 provider 降级保护'
    }, `${payload.parent_path_id || 'fallback'}-${level}-1`, level)
  ]
}

function pickBranchType(level, index) {
  const types = BRANCH_TYPES_BY_LEVEL[level] || [
    `level_${level}_a`,
    `level_${level}_b`,
    `level_${level}_c`
  ]
  return types[index] || types[types.length - 1]
}

function getTensionText(tension) {
  if (!tension) return ''
  return typeof tension === 'string' ? tension : tension.description || ''
}

function getPathTitle(path, fallbackIndex) {
  return path.continuation_hook || path.title || `HWP Path ${fallbackIndex + 1}`
}

function getNextQuestion(inner, path, index, level) {
  const question = Array.isArray(inner.questions) ? inner.questions[index] : ''
  if (question) return question

  const hook = path.continuation_hook || ''
  if (hook) {
    return hook.endsWith('?') ? hook : `${hook}?`
  }

  if (level === 1) return '这个问题下一步最值得继续追问什么？'
  return `围绕这条第${level}层路径，下一步最值得继续追问什么？`
}

function mapHwpInnerToPaths(inner, payload) {
  const level = Math.max(1, Number(payload.depth) || 1)
  const sourcePaths = Array.isArray(inner.paths) ? inner.paths.slice(0, 3) : []
  const tensions = Array.isArray(inner.tensions) ? inner.tensions : []
  const unfinished = Array.isArray(inner.unfinished) ? inner.unfinished : []
  const baseScore = typeof inner.entropy_score === 'number' ? inner.entropy_score : 0.75

  return sourcePaths.map((path, index) => {
    const blindSpot = path.blind_spot || {}
    const tensionText = getTensionText(tensions[index])
    const unfinishedText = unfinished[index]
    const summaryParts = [
      blindSpot.description,
      blindSpot.impact,
      tensionText ? `张力：${tensionText}` : '',
      unfinishedText ? `未完成方向：${unfinishedText}` : ''
    ].filter(Boolean)

    return normalizePath({
      id: level > 1
        ? `${payload.parent_path_id || 'hwp'}-${level}-${index + 1}`
        : `${inner.node_id || 'hwp-root'}-${index + 1}`,
      path_title: getPathTitle(path, index),
      path_summary: summaryParts.join(' '),
      next_question: getNextQuestion(inner, path, index, level),
      branch_type: pickBranchType(level, index),
      unfinished_score: Math.max(0.5, Math.min(0.99, baseScore + index * 0.05)),
      blind_spot_hint: blindSpot.description || 'HWP 返回了一条仍值得继续展开的方向'
    }, `hwp-${level}-${index + 1}`, level)
  })
}

async function runHwpProvider(payload) {
  const inputText = payload.depth > 1
    ? [
        payload.context?.parent_title,
        payload.context?.parent_summary,
        payload.context?.parent_next_question
      ].filter(Boolean).join('\n')
    : `${payload.question || ''}`

  if (!inputText.trim()) {
    throw new Error('HWP provider requires a non-empty input text')
  }

  const inner = await runHwpRunner(inputText)
  return mapHwpInnerToPaths(inner, payload)
}

async function resolvePaths(payload) {
  if (PROVIDER === 'hwp') {
    return runHwpProvider(payload)
  }

  if (PROVIDER === 'command') {
    return runCommandProvider(payload)
  }

  return runMockProvider(payload)
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    sendJson(res, 400, { error: 'Missing URL' })
    return
  }

  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {})
    return
  }

  if (req.method === 'GET' && req.url === '/api/demo/hwp/health') {
    sendJson(res, 200, {
      status: 'ok',
      provider: PROVIDER,
      providerMode: getLiveProviderMode(),
      llmConfigured: Boolean(HWP_LLM_MODEL && HWP_LLM_API_KEY),
      llmModel: HWP_LLM_MODEL || null,
      commandConfigured: Boolean(COMMAND),
      hwpRepoPath: HWP_REPO_PATH,
      hwpReplayChainPath: HWP_REPLAY_CHAIN_PATH || null,
      timestamp: new Date().toISOString()
    })
    return
  }

  if (req.method === 'POST' && req.url === '/api/demo/hwp/expand') {
    try {
      const payload = await readJson(req)
      const depth = Math.max(1, Number(payload.depth) || 1)
      const requestId = `req_${Date.now()}_${Math.floor(Math.random() * 10000)}`
      const startedAt = Date.now()

      if (depth === 1 && !String(payload.question || '').trim()) {
        sendJson(res, 400, { error: 'question is required for depth 1 expansion' })
        return
      }

      if (depth > 1 && !String(payload.parent_path_id || '').trim()) {
        sendJson(res, 400, { error: `parent_path_id is required for depth ${depth} expansion` })
        return
      }

      console.log(`[question-expander-adapter] ${requestId} start depth=${depth} mode=${getLiveProviderMode()} parent=${payload.parent_path_id || 'root'}`)

      let paths
      let degraded = false
      let degradeReason = null

      try {
        paths = await resolvePaths({ ...payload, depth })
        if (!Array.isArray(paths) || paths.length === 0) {
          throw new Error('provider returned empty paths')
        }
      } catch (error) {
        degraded = true
        degradeReason = error.message
        console.warn(`[question-expander-adapter] ${requestId} degrade: ${error.message}`)
        paths = makeFallbackPaths({ ...payload, depth }, error.message)
      }

      console.log(`[question-expander-adapter] ${requestId} done paths=${paths.length} degraded=${degraded} latency_ms=${Date.now() - startedAt}`)
      sendJson(res, 200, {
        paths,
        provider: PROVIDER,
        providerMode: getLiveProviderMode(),
        degraded,
        degradeReason,
        requestId,
        latencyMs: Date.now() - startedAt
      })
    } catch (error) {
      sendJson(res, 500, {
        error: 'adapter_error',
        message: error.message
      })
    }
    return
  }

  sendJson(res, 404, { error: 'not_found' })
})

server.listen(PORT, HOST, () => {
  console.log(`[question-expander-adapter] listening on http://${HOST}:${PORT}`)
  console.log(`[question-expander-adapter] provider=${PROVIDER}`)
  if (PROVIDER === 'command') {
    console.log(`[question-expander-adapter] command=${COMMAND || '(missing)'}`)
  }
})
