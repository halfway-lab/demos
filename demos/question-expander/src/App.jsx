import { useEffect, useState } from 'react'
import PathNode from './components/PathNode'
import { expandPaths, expandPathsByLevel, getCurrentMode, healthCheck } from './api/hwpClient'
import halfwayLogo from './assets/halfwaylogo.svg'
import './App.css'

const MAX_LEVEL = 33

function App() {
  const [input, setInput] = useState('')
  const [rootPaths, setRootPaths] = useState([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [mode, setMode] = useState('')
  const [childPathsMap, setChildPathsMap] = useState({})
  const [openPathIds, setOpenPathIds] = useState({})
  const [loadingPaths, setLoadingPaths] = useState({})
  const [pauseCards, setPauseCards] = useState({})
  const [pauseLoading, setPauseLoading] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusInfo, setStatusInfo] = useState({
    status: 'checking',
    providerMode: '',
    provider: '',
    llmModel: '',
    replay: false,
    message: '正在检查后端状态...'
  })
  const [activityMessage, setActivityMessage] = useState('')
  const [focusModeEnabled, setFocusModeEnabled] = useState(true)
  const [focusedPathId, setFocusedPathId] = useState(null)
  const [parentPathMap, setParentPathMap] = useState({})

  useEffect(() => {
    setMode(getCurrentMode())
    checkBackendHealth()
  }, [])

  const checkBackendHealth = async () => {
    const info = await healthCheck()

    if (info?.status === 'ok') {
      const providerMode = info.providerMode || info.provider || mode
      setStatusInfo({
        status: 'ok',
        providerMode,
        provider: info.provider || '',
        llmModel: info.llmModel || '',
        replay: Boolean(info.hwpReplayChainPath),
        message: buildStatusMessage(info)
      })
      return
    }

    setStatusInfo({
      status: 'error',
      providerMode: mode,
      provider: '',
      llmModel: '',
      replay: false,
      message: info?.message || '当前无法连接到 demo adapter'
    })
  }

  const resetTreeState = () => {
    setChildPathsMap({})
    setOpenPathIds({})
    setLoadingPaths({})
    setPauseCards({})
    setPauseLoading(null)
    setCopiedId(null)
    setFocusedPathId(null)
    setParentPathMap({})
  }

  const handleExpand = async () => {
    if (!input.trim()) return

    setLoading(true)
    setExpanded(false)
    setErrorMessage('')
    setActivityMessage('正在生成第 1 层展开...')
    resetTreeState()

    try {
      const result = await expandPaths(input.trim())
      setRootPaths(result)
      setParentPathMap(buildRootParentMap(result))
      setExpanded(true)
    } catch (error) {
      console.error('展开失败:', error)
      setErrorMessage(`展开失败：${error.message}`)
    } finally {
      setLoading(false)
      setActivityMessage('')
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleExpand()
    }
  }

  const handleExpandNext = async (path, currentLevel) => {
    const nextLevel = currentLevel + 1
    const pathId = String(path.id)
    setFocusedPathId(pathId)

    if (openPathIds[pathId]) {
      setOpenPathIds(prev => ({ ...prev, [pathId]: false }))
      return
    }

    setOpenPathIds(prev => ({ ...prev, [pathId]: true }))

    if (childPathsMap[pathId]) {
      setActivityMessage('')
      return
    }

    setLoadingPaths(prev => ({ ...prev, [pathId]: true }))
    setErrorMessage('')
    setActivityMessage(`正在生成第 ${nextLevel} 层展开...`)

    try {
      const result = await expandPathsByLevel(path, nextLevel)
      setChildPathsMap(prev => ({ ...prev, [pathId]: result }))
      setParentPathMap(prev => ({
        ...prev,
        ...buildChildParentMap(pathId, result)
      }))
    } catch (error) {
      console.error(`展开第${nextLevel}层路径失败:`, error)
      setOpenPathIds(prev => ({ ...prev, [pathId]: false }))
      setErrorMessage(`展开第 ${nextLevel} 层失败：${error.message}`)
    } finally {
      setLoadingPaths(prev => ({ ...prev, [pathId]: false }))
      setActivityMessage('')
    }
  }

  const handlePause = (path, level) => {
    const pathId = String(path.id)

    if (pauseCards[pathId]) {
      setPauseCards(prev => {
        const next = { ...prev }
        delete next[pathId]
        return next
      })
      return
    }

    setPauseLoading(pathId)

    setTimeout(() => {
      setPauseCards(prev => ({
        ...prev,
        [pathId]: generatePauseSummary(path, level)
      }))
      setPauseLoading(null)
    }, 350)
  }

  const handleCopyPathMarkdown = async (path, level) => {
    const pathId = String(path.id)
    const markdown = buildPathMarkdown({
      path,
      level,
      pauseCards,
      childPathsMap,
      openPathIds
    })

    try {
      await navigator.clipboard.writeText(markdown)
      setCopiedId(pathId)
      setTimeout(() => setCopiedId(null), 1500)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  const focusedScopeIds = getFocusedScopeIds({
    focusedPathId,
    focusModeEnabled,
    parentPathMap,
    childPathsMap
  })

  return (
    <div className="container">
      <header className="header">
        <img className="header-logo" src={halfwayLogo} alt="Half Way logo" />
        <div className="brand-mark">Half Way</div>
        <h1>Question Expander</h1>
        <p className="subtitle">把一句话展开成多个思考方向</p>
      </header>

      {statusInfo.status === 'error' && (
        <div className="soft-warning-banner">
          {statusInfo.message}
        </div>
      )}

      {activityMessage && (
        <div className="info-banner">
          {activityMessage}
        </div>
      )}

      {errorMessage && (
        <div className="error-banner">
          <span>{errorMessage}</span>
          <button className="banner-close-btn" onClick={() => setErrorMessage('')}>关闭</button>
        </div>
      )}

      <div className="input-section">
        <div className="input-wrapper">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入一句话，比如：我想提高工作效率..."
            className="input"
          />
          <button
            onClick={handleExpand}
            disabled={loading || !input.trim()}
            className="expand-btn"
          >
            {loading ? '展开中...' : 'Expand'}
          </button>
        </div>
      </div>

      {!expanded && !loading && !errorMessage && (
        <div className="empty-state-card">
          <div className="empty-state-title">Start From Half Way</div>
          <p className="empty-state-text">
            输入一个问题，系统不会直接给结论，而是先展开成多条仍值得继续追问的方向。
          </p>
          <p className="empty-state-text">
            {statusInfo.replay
              ? '当前连接的是 replay 模式，适合稳定演示，但结果不会随输入实时变化。'
              : statusInfo.llmModel
                ? `当前已连接 live 模式，模型为 ${statusInfo.llmModel}。`
                : '当前系统会按可用配置自动切换到 mock、replay 或 live 模式。'}
          </p>
          <div className="empty-state-hints">
            <span>试试：我想提高工作效率</span>
            <span>试试：这个产品为什么增长停滞</span>
            <span>试试：我要不要换工作</span>
          </div>
        </div>
      )}

      {expanded && (
        <div className="paths-section">
          <div className="paths-header">
            <div className="paths-header-main">
              <span className="fork-icon">⚡</span>
              <span>展开 {rootPaths.length} 条思考路径</span>
            </div>
            <button
              type="button"
              className={`focus-toggle-btn ${focusModeEnabled ? 'active' : ''}`}
              onClick={() => setFocusModeEnabled(prev => !prev)}
            >
              {focusModeEnabled ? '聚焦当前分支：开' : '聚焦当前分支：关'}
            </button>
          </div>

          <div className="paths-container">
            {rootPaths.map((path, index) => (
              <PathNode
                key={path.id}
                path={path}
                level={path.level || 1}
                maxLevel={MAX_LEVEL}
                onExpandNext={handleExpandNext}
                onPause={handlePause}
                onCopyPathMarkdown={handleCopyPathMarkdown}
                pauseCards={pauseCards}
                pauseLoading={pauseLoading}
                copiedId={copiedId}
                openPathIds={openPathIds}
                loadingPaths={loadingPaths}
                childPathsMap={childPathsMap}
                focusModeEnabled={focusModeEnabled}
                focusedPathId={focusedPathId}
                focusedScopeIds={focusedScopeIds}
                animationDelay={`${index * 80}ms`}
              />
            ))}
          </div>
        </div>
      )}

      <footer className="footer">
        <p>HWP Demo 01 · {mode === 'hwp_api' ? '真实 API 模式' : '本地 Mock 数据模式'}</p>
      </footer>
    </div>
  )
}

function buildRootParentMap(paths) {
  return Object.fromEntries((paths || []).map(path => [String(path.id), null]))
}

function buildChildParentMap(parentId, children) {
  return Object.fromEntries((children || []).map(child => [String(child.id), parentId]))
}

function getFocusedScopeIds({ focusedPathId, focusModeEnabled, parentPathMap, childPathsMap }) {
  if (!focusModeEnabled || !focusedPathId) {
    return null
  }

  const scopeIds = new Set([focusedPathId])
  let currentId = focusedPathId

  while (parentPathMap[currentId]) {
    currentId = parentPathMap[currentId]
    scopeIds.add(currentId)
  }

  const stack = [focusedPathId]
  while (stack.length > 0) {
    const pathId = stack.pop()
    const children = childPathsMap[pathId] || []

    children.forEach(child => {
      const childId = String(child.id)
      if (scopeIds.has(childId)) {
        return
      }

      scopeIds.add(childId)
      stack.push(childId)
    })
  }

  return scopeIds
}

function buildStatusMessage(info) {
  const parts = []

  if (info.providerMode) {
    parts.push(`模式：${info.providerMode}`)
  }

  if (info.hwpReplayChainPath) {
    parts.push('当前为 replay 结果，不随输入实时变化')
  } else if (info.llmModel) {
    parts.push(`模型：${info.llmModel}`)
  }

  if (info.provider) {
    parts.push(`provider：${info.provider}`)
  }

  return parts.join(' · ') || '后端已连接'
}

function generatePauseSummary(path, level) {
  const levelNames = [
    '',
    '问题层面',
    '分析层面',
    '行动层面',
    '执行层面',
    '细化层面',
    '验证层面',
    '优化层面',
    '固化层面',
    '迭代层面'
  ]

  return {
    id: `pause-${path.id}`,
    title: `${levelNames[Math.min(level, 9)] || `第${level}层`}的阶段性思考`,
    keyInsight: path.blind_spot_hint || '这条路径仍有继续展开的空间',
    nextAction: path.next_question || '继续澄清这条路径的关键问题',
    level,
    created_at: new Date().toISOString()
  }
}

function buildPathMarkdown({ path, level, pauseCards, childPathsMap, openPathIds }) {
  const lines = []
  appendPathMarkdown(lines, path, level, pauseCards, childPathsMap, openPathIds)
  return lines.join('\n').trim()
}

function appendPathMarkdown(lines, path, level, pauseCards, childPathsMap, openPathIds) {
  const pathId = String(path.id)
  const headingLevel = Math.min(level + 1, 6)
  const headingPrefix = '#'.repeat(headingLevel)

  lines.push(`${headingPrefix} ${path.path_title}`)
  lines.push('')
  lines.push(`- 层级：第${level}层`)
  lines.push(`- 类型：${path.branch_type || 'unknown'}`)
  lines.push(`- 未完成度：${Math.round((path.unfinished_score || 0) * 100)}%`)

  if (path.blind_spot_hint) {
    lines.push(`- 盲点提示：${path.blind_spot_hint}`)
  }

  lines.push('')
  lines.push(path.path_summary || '暂无摘要')
  lines.push('')
  lines.push('**下一步问题**')
  lines.push('')
  lines.push(path.next_question || '暂无下一步问题')
  lines.push('')

  const pauseCard = pauseCards[pathId]
  if (pauseCard) {
    lines.push('**停一下**')
    lines.push('')
    lines.push(`- 标题：${pauseCard.title || '阶段性思考'}`)
    lines.push(`- 核心洞察：${pauseCard.keyInsight || '暂无'}`)
    lines.push(`- 下一步：${pauseCard.nextAction || '暂无'}`)
    lines.push('')
  }

  const children = childPathsMap[pathId] || []
  if (openPathIds[pathId] && children.length > 0) {
    lines.push('**已展开的后续分支**')
    lines.push('')
    children.forEach(child => {
      appendPathMarkdown(lines, child, child.level || level + 1, pauseCards, childPathsMap, openPathIds)
    })
  }
}

export default App
