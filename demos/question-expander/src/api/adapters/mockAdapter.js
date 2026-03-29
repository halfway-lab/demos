/**
 * Mock Adapter - 本地数据适配器
 * 
 * 职责：
 * 1. 调用本地 mock 数据函数
 * 2. 统一数据格式转换（确保返回标准 Path 结构）
 * 3. 模拟网络延迟和错误情况
 * 
 * 当切换到真实 HWP 接口时，此文件可被替换为 hwpApiAdapter.js
 */

import { 
  mockExpandPaths, 
  mockExpandSubPaths, 
  mockExpandThirdPaths, 
  mockExpandFourthPaths,
  mockExpandPathsByLevel 
} from '../../mock/hwpPaths'

/**
 * 标准化路径数据
 * 确保所有路径对象包含统一字段
 */
function normalizePath(rawPath, level = 1) {
  return {
    // 核心标识
    id: rawPath.id || `path-${level}-${Date.now()}`,
    
    // 路径内容
    path_title: rawPath.path_title || '未命名路径',
    path_summary: rawPath.path_summary || '',
    next_question: rawPath.next_question || '',
    
    // HWP 协议字段
    branch_type: rawPath.branch_type || 'unknown',
    unfinished_score: typeof rawPath.unfinished_score === 'number' 
      ? rawPath.unfinished_score 
      : 0.5,
    blind_spot_hint: rawPath.blind_spot_hint || '',
    
    // 元信息
    level,
    created_at: rawPath.created_at || new Date().toISOString()
  }
}

/**
 * 展开一级路径
 * @param {string} input - 用户输入的问题
 * @returns {Promise<Array>} 标准化后的路径数组
 */
export async function expandPaths(input) {
  try {
    const rawPaths = await mockExpandPaths(input)
    return rawPaths.map(path => normalizePath(path, 1))
  } catch (error) {
    console.error('[MockAdapter] expandPaths error:', error)
    throw new Error('展开路径失败: ' + error.message)
  }
}

/**
 * 展开二级子路径
 * @param {Object} parentPath - 父路径对象
 * @returns {Promise<Array>} 标准化后的子路径数组
 */
export async function expandSubPaths(parentPath) {
  try {
    const { id: parentId, path_title: parentTitle } = parentPath
    const rawSubPaths = await mockExpandSubPaths(parentId, parentTitle)
    return rawSubPaths.map(path => normalizePath(path, 2))
  } catch (error) {
    console.error('[MockAdapter] expandSubPaths error:', error)
    throw new Error('展开子路径失败: ' + error.message)
  }
}

/**
 * 展开三级子路径
 * @param {Object} parentPath - 父路径对象
 * @returns {Promise<Array>} 标准化后的三级路径数组
 */
export async function expandThirdPaths(parentPath) {
  try {
    const { id: parentId, path_title: parentTitle } = parentPath
    const rawThirdPaths = await mockExpandThirdPaths(parentId, parentTitle)
    return rawThirdPaths.map(path => normalizePath(path, 3))
  } catch (error) {
    console.error('[MockAdapter] expandThirdPaths error:', error)
    throw new Error('展开三级路径失败: ' + error.message)
  }
}

/**
 * 展开四级子路径
 * @param {Object} parentPath - 父路径对象
 * @returns {Promise<Array>} 标准化后的四级路径数组
 */
export async function expandFourthPaths(parentPath) {
  try {
    const { id: parentId, path_title: parentTitle } = parentPath
    const rawFourthPaths = await mockExpandFourthPaths(parentId, parentTitle)
    return rawFourthPaths.map(path => normalizePath(path, 4))
  } catch (error) {
    console.error('[MockAdapter] expandFourthPaths error:', error)
    throw new Error('展开四级路径失败: ' + error.message)
  }
}

/**
 * 通用层级展开 - 支持任意层级
 * @param {Object} parentPath - 父路径对象
 * @param {number} level - 目标层级
 * @returns {Promise<Array>} 标准化后的路径数组
 */
export async function expandPathsByLevel(parentPath, level) {
  try {
    const { id: parentId, path_title: parentTitle } = parentPath
    const rawPaths = await mockExpandPathsByLevel(parentId, parentTitle, level)
    return rawPaths.map(path => normalizePath(path, level))
  } catch (error) {
    console.error(`[MockAdapter] expandPathsByLevel level ${level} error:`, error)
    throw new Error(`展开第${level}层路径失败: ` + error.message)
  }
}

/**
 * 检查服务健康状态（Mock 模式始终返回健康）
 */
export async function healthCheck() {
  return { status: 'ok', mode: 'mock', timestamp: Date.now() }
}
