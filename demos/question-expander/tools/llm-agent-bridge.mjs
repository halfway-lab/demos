#!/usr/bin/env node
/**
 * LLM Agent Bridge - 通用大模型适配器
 * 
 * 用法:
 *   export HWP_AGENT_BIN=/Users/mac/Documents/Halfway-Lab/demos/halfway-demos/demos/question-expander/tools/llm-agent-bridge.mjs
 *   export LLM_API_KEY=your-api-key
 *   export LLM_API_URL=https://api.openai.com/v1/chat/completions
 *   export LLM_MODEL=gpt-4o-mini
 * 
 * 兼容 openclaw 接口:
 *   llm-agent-bridge.mjs agent --message "..." --session-id "..." --json
 */

import https from 'node:https'
import http from 'node:http'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 配置
const API_KEY = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY
const API_URL = process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions'
const MODEL = process.env.LLM_MODEL || 'gpt-4o-mini'
const TIMEOUT = parseInt(process.env.LLM_TIMEOUT || '60000', 10)

// 读取 HWP prompt 模板
function resolveHwpRepoPath() {
  const candidates = [
    process.env.HWP_REPO_PATH,
    join(__dirname, '..', '..', '..', '..', '..', 'protocol', 'HWP')
  ].filter(Boolean)

  return candidates.find(candidate => existsSync(candidate)) || candidates[0]
}

function loadPromptTemplate() {
  try {
    const hwpRepoPath = resolveHwpRepoPath()
    const promptPath = join(hwpRepoPath, 'spec', 'hwp_turn_prompt.txt')
    return readFileSync(promptPath, 'utf8')
  } catch (error) {
    console.error('Warning: Could not load prompt template:', error.message)
    return null
  }
}

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2)
  const result = { command: '', message: '', sessionId: '', json: false }
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    switch (arg) {
      case 'agent':
        result.command = 'agent'
        break
      case '--message':
        result.message = args[++i] || ''
        break
      case '--session-id':
        result.sessionId = args[++i] || ''
        break
      case '--json':
        result.json = true
        break
    }
  }
  
  return result
}

// 构建请求体
function buildRequestBody(userMessage) {
  const template = loadPromptTemplate()
  
  // 从用户消息中提取上一轮的结果（如果有）
  let systemPrompt = template || `You are HWP (Half Way Protocol), a non-convergent cognitive generation protocol.
Your role is to NOT provide final answers, but to continuously generate new questions and unfinished directions.

Core principles:
1. Never summarize or conclude
2. Always expand into multiple unfinished paths
3. Maintain the tension of exploration
4. Output valid JSON with paths, tensions, unfinished directions

Response format (MUST be valid JSON):
{
  "node_id": "unique-id",
  "paths": [
    {
      "continuation_hook": "A question that continues this path",
      "blind_spot": { "description": "What's being overlooked" },
      "title": "Path title"
    }
  ],
  "tensions": ["Tension descriptions"],
  "unfinished": ["Unfinished directions"],
  "entropy_score": 0.75
}`

  return {
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.8,
    max_tokens: 2000,
    response_format: { type: 'json_object' }
  }
}

// 调用 LLM API
async function callLLM(userMessage) {
  if (!API_KEY) {
    throw new Error('LLM_API_KEY or OPENAI_API_KEY environment variable is required')
  }

  const url = new URL(API_URL)
  const body = JSON.stringify(buildRequestBody(userMessage))
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: TIMEOUT
    }

    const client = url.protocol === 'https:' ? https : http
    
    const req = client.request(options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data)
          const content = response.choices?.[0]?.message?.content
          
          if (!content) {
            reject(new Error('No content in LLM response'))
            return
          }
          
          // 解析 LLM 返回的 JSON
          const hwpResult = JSON.parse(content)
          resolve(hwpResult)
        } catch (error) {
          reject(new Error(`Failed to parse LLM response: ${error.message}`))
        }
      })
    })

    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('LLM request timeout'))
    })

    req.write(body)
    req.end()
  })
}

// 主函数
async function main() {
  const args = parseArgs()
  
  if (args.command !== 'agent') {
    console.error('Usage: llm-agent-bridge.mjs agent --message "..." --session-id "..." --json')
    process.exit(1)
  }

  if (!args.message) {
    console.error('Error: --message is required')
    process.exit(1)
  }

  try {
    const hwpResult = await callLLM(args.message)
    
    // 包装成 openclaw 兼容格式
    const output = {
      result: {
        payloads: [
          {
            text: JSON.stringify(hwpResult)
          }
        ]
      }
    }

    if (args.json) {
      console.log(JSON.stringify(output))
    } else {
      console.log(output.result.payloads[0].text)
    }
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

main()
