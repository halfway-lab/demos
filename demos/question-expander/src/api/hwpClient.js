/**
 * HWP Client - 统一数据访问层
 * 
 * 职责：
 * 1. 根据配置决定使用哪个 Adapter（mock / hwp_api）
 * 2. 统一暴露标准接口给上层（App.jsx）
 * 3. 处理通用逻辑（错误处理、重试、日志等）
 * 4. 通过 Demo 自己的适配层间接对接最新 HWP
 * 
 * 使用方式：
 *   import { expandPaths, expandSubPaths } from './api/hwpClient'
 */

import { CURRENT_MODE, HWP_MODE, HWP_API_CONFIG, FEATURE_FLAGS } from '../config/hwpMode'
import * as mockAdapter from './adapters/mockAdapter'

// ============================================
// 当前使用的 Adapter
// ============================================
// 注意：hwpApiAdapter 定义在本文件下方
// 使用 let 以便后续重新赋值
let adapter = CURRENT_MODE === HWP_MODE.MOCK 
  ? mockAdapter 
  : {}

// ============================================
// 对外暴露的标准接口
// ============================================

/**
 * 展开一级路径
 * @param {string} input - 用户输入的问题
 * @returns {Promise<Array>} 路径数组
 */
export async function expandPaths(input) {
  const startedAt = Date.now()
  console.log(`[HWPClient] expandPaths called (mode: ${CURRENT_MODE})`)
  
  try {
    const result = await adapter.expandPaths(input)
    console.log(`[HWPClient] expandPaths success: ${result.length} paths in ${Date.now() - startedAt}ms`)
    return result
  } catch (error) {
    console.error('[HWPClient] expandPaths failed:', error)
    throw error
  }
}

/**
 * 展开二级子路径
 * @param {Object} parentPath - 父路径对象（需包含 id 和 path_title）
 * @returns {Promise<Array>} 子路径数组
 */
export async function expandSubPaths(parentPath) {
  console.log(`[HWPClient] expandSubPaths called (mode: ${CURRENT_MODE})`)
  
  try {
    const result = await adapter.expandSubPaths(parentPath)
    console.log(`[HWPClient] expandSubPaths success: ${result.length} sub-paths`)
    return result
  } catch (error) {
    console.error('[HWPClient] expandSubPaths failed:', error)
    throw error
  }
}

/**
 * 展开三级子路径
 * @param {Object} parentPath - 父路径对象（需包含 id 和 path_title）
 * @returns {Promise<Array>} 三级路径数组
 */
export async function expandThirdPaths(parentPath) {
  return expandPathsByLevel(parentPath, 3)
}

/**
 * 展开四级子路径
 * @param {Object} parentPath - 父路径对象（需包含 id 和 path_title）
 * @returns {Promise<Array>} 四级路径数组
 */
export async function expandFourthPaths(parentPath) {
  return expandPathsByLevel(parentPath, 4)
}

/**
 * 通用层级展开 - 支持任意层级（最多33层）
 * @param {Object} parentPath - 父路径对象
 * @param {number} level - 目标层级（1-33）
 * @returns {Promise<Array>} 路径数组
 */
export async function expandPathsByLevel(parentPath, level) {
  const startedAt = Date.now()
  console.log(`[HWPClient] expandPathsByLevel called (mode: ${CURRENT_MODE}, level: ${level})`)
  
  try {
    const result = await adapter.expandPathsByLevel(parentPath, level)
    console.log(`[HWPClient] expandPathsByLevel success: ${result.length} paths at level ${level} in ${Date.now() - startedAt}ms`)
    return result
  } catch (error) {
    console.error(`[HWPClient] expandPathsByLevel level ${level} failed:`, error)
    throw error
  }
}

/**
 * 健康检查
 */
export async function healthCheck() {
  return adapter.healthCheck()
}

/**
 * 获取当前运行模式
 */
export function getCurrentMode() {
  return CURRENT_MODE
}

export function getApiBaseUrl() {
  return HWP_API_CONFIG.baseURL
}

// ============================================
// HWP Adapter（占位实现）
// ============================================
// 当前 HWP 主线（v0.6 RC2）更推荐 runner / hwp_protocol CLI，
// hwp_server.py 仅作为 legacy helper 保留。
//
// TODO: 当 Demo 后端适配层就绪后，实现以下功能：
// 1. 创建 src/api/adapters/hwpApiAdapter.js
// 2. 实现基于 fetch 的 HTTP 调用，目标是 Demo 自己的 facade
// 3. 替换下方的占位对象

const hwpApiAdapter = {
  /**
   * TODO: 调用 Demo adapter 的一级路径展开接口
   * 
   * 推荐 API:
   * POST /api/demo/hwp/expand
   * {
   *   "question": "用户输入",
   *   "depth": 1,
   *   "options": {
   *     "max_paths": 3
   *   }
   * }
   *
   * 适配层内部可以：
   * - 调用 HWP v0.6 RC2 runner / hwp_protocol CLI
   * - 或兼容 legacy hwp_server.py
   * - 最终统一映射为前端 Path 结构
   */
  async expandPaths(input) {
    const response = await withRetry(() =>
      fetch(`${HWP_API_CONFIG.baseURL}/expand`, {
        method: 'POST',
        headers: HWP_API_CONFIG.headers,
        body: JSON.stringify({
          question: input,
          depth: 1,
          options: { max_paths: 3 }
        })
      })
    )
    
    if (!response.ok) {
      throw new Error(`HWP API error: ${response.status}`)
    }
    
    const data = await response.json()
    return normalizeApiResponse(data)
  },

  /**
   * TODO: 调用 Demo adapter 的二级路径展开接口
   * 
   * 推荐 API:
   * POST /api/demo/hwp/expand
   * {
   *   "question": "原始问题",
   *   "parent_path_id": "path-1",
   *   "context": {
   *     "parent_title": "选中的路径标题"
   *   },
   *   "depth": 2
   * }
   */
  async expandSubPaths(parentPath) {
    return requestExpandByLevel(parentPath, 2)
  },

  async expandThirdPaths(parentPath) {
    return requestExpandByLevel(parentPath, 3)
  },

  async expandFourthPaths(parentPath) {
    return requestExpandByLevel(parentPath, 4)
  },

  async expandPathsByLevel(parentPath, level) {
    return requestExpandByLevel(parentPath, level)
  },

  async healthCheck() {
    try {
      const response = await fetch(`${HWP_API_CONFIG.baseURL}/health`)
      return await response.json()
    } catch (error) {
      return { status: 'error', message: error.message }
    }
  }
}

/**
 * 标准化 API 响应格式
 * 确保适配层返回的数据结构与前端期望一致
 */
function normalizeApiResponse(apiData) {
  const list = Array.isArray(apiData) ? apiData : apiData?.paths

  if (!Array.isArray(list)) {
    throw new Error('Adapter response did not contain a paths array')
  }

  const normalized = list
    .filter(Boolean)
    .map((path, index) => ({
      id: String(path.id ?? `path-${Date.now()}-${index + 1}`),
      path_title: path.path_title || path.title || `未命名路径 ${index + 1}`,
      path_summary: path.path_summary || path.summary || '当前返回缺少摘要，建议检查 provider 输出结构。',
      next_question: path.next_question || path.nextQuestion || '继续追问这个方向里最值得澄清的部分。',
      branch_type: path.branch_type || path.branchType || 'unknown',
      unfinished_score: typeof path.unfinished_score === 'number' ? path.unfinished_score : 0.5,
      blind_spot_hint: path.blind_spot_hint || path.blindSpotHint || '当前返回缺少 blind spot 字段。',
      level: path.level ?? 1,
      created_at: path.created_at || path.createdAt || new Date().toISOString()
    }))

  if (normalized.length === 0) {
    throw new Error('Adapter returned an empty paths array')
  }

  return dedupePaths(normalized)
}

function dedupePaths(paths) {
  const seen = new Set()
  return paths.map((path, index) => {
    let nextId = String(path.id)
    if (seen.has(nextId)) {
      nextId = `${nextId}-${index + 1}`
    }
    seen.add(nextId)
    return { ...path, id: nextId }
  })
}

async function requestExpandByLevel(parentPath, level) {
  const response = await withRetry(() =>
    fetch(`${HWP_API_CONFIG.baseURL}/expand`, {
      method: 'POST',
      headers: HWP_API_CONFIG.headers,
      body: JSON.stringify({
        parent_path_id: parentPath.id,
        context: {
          parent_title: parentPath.path_title,
          parent_summary: parentPath.path_summary,
          parent_next_question: parentPath.next_question,
          parent_level: parentPath.level ?? level - 1
        },
        depth: level
      })
    })
  )

  if (!response.ok) {
    throw new Error(`HWP API error: ${response.status}`)
  }

  const data = await response.json()
  return normalizeApiResponse(data)
}

// 非 Mock 模式下，将 adapter 指向 hwpApiAdapter
if (CURRENT_MODE !== HWP_MODE.MOCK) {
  adapter = hwpApiAdapter
}

// ============================================
// 工具函数
// ============================================

/**
 * 带重试的请求包装器
 */
async function withRetry(fn, retries = FEATURE_FLAGS.maxRetries) {
  if (!FEATURE_FLAGS.enableRetry) {
    return fn()
  }
  
  let lastError
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      console.warn(`[HWPClient] Retry ${i + 1}/${retries}`)
      await sleep(1000 * (i + 1))  // 指数退避
    }
  }
  throw lastError
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
