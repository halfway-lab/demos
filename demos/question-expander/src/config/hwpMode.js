/**
 * HWP 运行模式配置
 * 
 * 说明：
 * - mock: 使用本地 mock 数据，无需后端服务
 * - hwp_api: 连接 Demo 自己的适配层后端，由适配层对接最新 HWP
 * 
 * 切换方式：修改 MODE 值即可
 */

export const HWP_MODE = {
  MOCK: 'mock',
  HWP_API: 'hwp_api'
}

// 当前运行模式
export const CURRENT_MODE = HWP_MODE.MOCK

// HWP API 配置（仅在 HWP_API 模式下使用）
// 推荐做法：
// 1. 前端只调用 Demo 自己的 adapter/facade
// 2. adapter/facade 再去对接 HWP v0.6 RC2 的 runner / hwp_protocol CLI
// 3. 不让前端直接依赖 HWP 内部脚本、日志或 legacy HTTP helper
export const HWP_API_CONFIG = {
  // 优先使用显式环境变量，其次走同源路径，避免线上 demo 指向访问者本机 localhost。
  baseURL: resolveApiBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
}

// 功能开关
export const FEATURE_FLAGS = {
  // 是否启用 SSE 流式输出
  enableStreaming: false,
  // 是否启用请求重试
  enableRetry: true,
  // 最大重试次数
  maxRetries: 3
}

function resolveApiBaseURL() {
  const configuredBaseURL = import.meta.env.VITE_HWP_API_BASE_URL?.trim()
  if (configuredBaseURL) {
    return configuredBaseURL.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/demo/hwp`
  }

  return '/api/demo/hwp'
}
