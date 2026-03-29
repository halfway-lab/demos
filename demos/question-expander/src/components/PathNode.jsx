import { getBranchTypeLabel } from '../mock/hwpPaths'
import halfwayLogo from '../assets/halfwaylogo.svg'

function PathNode({
  path,
  level = 1,
  maxLevel = 33,
  onExpandNext,
  onPause,
  onCopyPathMarkdown,
  pauseCards,
  pauseLoading,
  copiedId,
  openPathIds,
  loadingPaths,
  childPathsMap,
  focusModeEnabled,
  focusedPathId,
  focusedScopeIds,
  animationDelay = '0ms'
}) {
  const pathId = String(path.id)
  const children = childPathsMap[pathId] || []
  const isOpen = Boolean(openPathIds[pathId])
  const isLoading = Boolean(loadingPaths[pathId])
  const pauseCard = pauseCards[pathId]
  const colors = getLevelColors(level)
  const levelLabel = getLevelLabel(level)
  const depthClass = level >= 10 ? 'deep-depth' : level >= 6 ? 'compact-depth' : ''
  const childIndent = getChildIndent(level)
  const isFocusedPath = focusModeEnabled && focusedPathId === pathId
  const isInFocusScope = !focusModeEnabled || !focusedScopeIds || focusedScopeIds.has(pathId)
  const pathNodeClassName = [
    'path-node',
    depthClass,
    focusModeEnabled && focusedPathId ? (isInFocusScope ? 'in-focus-scope' : 'out-of-focus-scope') : '',
    isFocusedPath ? 'focused-path' : ''
  ].filter(Boolean).join(' ')

  return (
    <div className={pathNodeClassName} style={{ '--child-indent': `${childIndent}px` }}>
      <div
        className={`path-node-card ${isOpen ? 'expanded' : ''}`}
        style={{
          animationDelay,
          background: colors.cardBg,
          border: `1px solid ${colors.borderColor}`
        }}
      >
        <div className="path-node-branch">
          <div className="branch-line" style={{ background: colors.branchLine }}></div>
          <div className="branch-dot" style={{ background: colors.branchDot }}></div>
        </div>

        <div className="path-node-content">
          <div className="path-node-header">
            <h3 className="path-node-title" style={{ color: colors.titleColor }}>
              {path.path_title}
            </h3>
            <span className="path-node-score">
              未完成度 {Math.round((path.unfinished_score || 0) * 100)}%
            </span>
          </div>

          <p className="path-node-summary">{path.path_summary}</p>

          <div className="path-node-meta">
            <span className="path-node-type">{getBranchTypeLabel(path.branch_type)}</span>
            <span className="path-node-blind">{path.blind_spot_hint}</span>
          </div>

          <div
            className="path-node-question"
            style={{ borderLeft: `3px solid ${colors.borderColor}` }}
          >
            <span className="question-label" style={{ color: colors.titleColor }}>
              下一步：
            </span>
            <span className="question-text">{path.next_question}</span>
          </div>

          <div className="path-node-actions-row">
            <button
              className="copy-btn"
              onClick={() => onCopyPathMarkdown(path, level)}
              title="复制当前展开分支为 Markdown"
            >
              {copiedId === pathId ? '✓ 已复制' : '复制 Markdown'}
            </button>

            <div className="path-node-actions">
              <button
                className="pause-btn inline-action-btn"
                onClick={() => onPause(path, level)}
                disabled={pauseLoading === pathId}
                title="整理当前思考"
              >
                {pauseLoading === pathId ? '整理中...' : (pauseCard ? '收起停一下' : '停一下')}
              </button>

              {level < maxLevel && (
                <button
                  className="expand-next-btn inline-action-btn"
                  onClick={() => onExpandNext(path, level)}
                  disabled={isLoading}
                  style={{
                    color: colors.titleColor,
                    borderColor: colors.borderColor
                  }}
                >
                  {isLoading ? '展开中...' : isOpen ? '收起' : `继续展开第${level + 1}层`}
                </button>
              )}

              <img
                className="action-logo"
                src={halfwayLogo}
                alt="Half Way"
              />
            </div>
          </div>

          {pauseCard && (
            <div className="pause-card">
              <div className="pause-card-header">
                <span className="pause-icon">☕</span>
                <span className="pause-title">{pauseCard.title || `${levelLabel}的阶段性思考`}</span>
              </div>
              <div className="pause-card-content">
                <p className="pause-insight">
                  <strong>核心洞察：</strong>{pauseCard.keyInsight}
                </p>
                <p className="pause-action">
                  <strong>下一步：</strong>{pauseCard.nextAction}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {isOpen && children.length > 0 && (
        <div className="path-node-children">
          {children.map((child, index) => (
            <PathNode
              key={child.id}
              path={child}
              level={child.level || level + 1}
              maxLevel={maxLevel}
              onExpandNext={onExpandNext}
              onPause={onPause}
              onCopyPathMarkdown={onCopyPathMarkdown}
              pauseCards={pauseCards}
              pauseLoading={pauseLoading}
              copiedId={copiedId}
              openPathIds={openPathIds}
              loadingPaths={loadingPaths}
              childPathsMap={childPathsMap}
              focusModeEnabled={focusModeEnabled}
              focusedPathId={focusedPathId}
              focusedScopeIds={focusedScopeIds}
              animationDelay={`${index * 50}ms`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function getLevelColors(level) {
  const hue = ((level - 1) * 9) % 360
  const saturation = Math.max(22, 72 - level * 1.6)
  const lightness = Math.max(84, 96 - level * 0.7)

  return {
    cardBg: level === 1
      ? 'white'
      : `linear-gradient(135deg, hsl(${hue}, ${saturation - 18}%, ${lightness + 2}%) 0%, hsl(${hue}, ${saturation - 24}%, ${lightness - 1}%) 100%)`,
    borderColor: `hsl(${hue}, ${Math.max(18, saturation - 28)}%, ${Math.max(72, lightness - 8)}%)`,
    titleColor: `hsl(${hue}, ${Math.max(25, saturation - 15)}%, ${Math.max(28, 42 - level * 0.35)}%)`,
    branchLine: `linear-gradient(to bottom, hsl(${hue}, ${Math.max(18, saturation - 24)}%, ${Math.max(70, lightness - 6)}%), hsl(${hue}, ${Math.max(14, saturation - 30)}%, ${Math.max(76, lightness)}) )`,
    branchDot: `linear-gradient(135deg, hsl(${hue}, ${Math.max(20, saturation - 16)}%, ${Math.max(64, lightness - 10)}) 0%, hsl(${hue}, ${Math.max(16, saturation - 26)}%, ${Math.max(74, lightness - 2)}) 100%)`
  }
}

function getLevelLabel(level) {
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

  return levelNames[Math.min(level, 9)] || `第${level}层`
}

function getChildIndent(level) {
  if (level <= 2) return 18
  if (level <= 5) return 14
  if (level <= 9) return 10
  return 7
}

export default PathNode
