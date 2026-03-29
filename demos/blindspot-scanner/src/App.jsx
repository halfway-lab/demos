import { useState } from 'react'
import './App.css'

// 盲点扫描维度定义
const blindspotDimensions = [
  {
    id: 'time',
    name: '时间维度',
    icon: '⏰',
    description: '短期与长期影响的考量',
    questions: [
      '这个决策1天后、1个月后、1年后会有什么不同影响？',
      '是否存在时间上的紧迫性压力？',
      '是否有更好的时机来做这个决定？',
      '过去类似决策的结果如何？',
    ],
  },
  {
    id: 'relationship',
    name: '关系维度',
    icon: '🤝',
    description: '涉及的人员和关系影响',
    questions: [
      '哪些人会受到这个决策的影响？',
      '关键利益相关者的立场是什么？',
      '这个决定会如何影响重要关系？',
      '是否有被忽视的反对声音？',
    ],
  },
  {
    id: 'emotion',
    name: '情绪维度',
    icon: '💭',
    description: '情绪状态和认知偏差',
    questions: [
      '我现在的情绪状态是否影响了判断？',
      '是否存在确认偏误（只寻找支持证据）？',
      '是否因为沉没成本而难以放弃？',
      '恐惧或贪婪是否在驱动这个决定？',
    ],
  },
  {
    id: 'information',
    name: '信息维度',
    icon: '📊',
    description: '信息的完整性和准确性',
    questions: [
      '我是否掌握了足够的信息？',
      '信息的来源是否可靠？',
      '是否存在我不知道的重要信息？',
      '我是否在过度自信自己的判断？',
    ],
  },
  {
    id: 'alternative',
    name: '替代方案',
    icon: '🔄',
    description: '其他可能的选择',
    questions: [
      '除了当前方案，还有哪些替代选项？',
      '如果不做这个决定会怎样？',
      '是否有折中或混合方案？',
      '别人在类似情况下会怎么做？',
    ],
  },
  {
    id: 'risk',
    name: '风险维度',
    icon: '⚠️',
    description: '潜在风险和最坏情况',
    questions: [
      '最坏的情况是什么？我能承受吗？',
      '这个决策有哪些隐藏风险？',
      '如果失败，我的退路是什么？',
      '是否对可能的问题过于乐观？',
    ],
  },
]

function App() {
  const [decision, setDecision] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [selectedDimensions, setSelectedDimensions] = useState([])
  const [reflections, setReflections] = useState({})

  const startScan = () => {
    if (!decision.trim()) return
    setIsScanning(true)
    setScanComplete(false)
    setSelectedDimensions([])
    setReflections({})
    
    // 模拟扫描动画
    setTimeout(() => {
      setIsScanning(false)
      setScanComplete(true)
    }, 2000)
  }

  const toggleDimension = (id) => {
    setSelectedDimensions(prev => 
      prev.includes(id) 
        ? prev.filter(d => d !== id)
        : [...prev, id]
    )
  }

  const updateReflection = (dimensionId, questionIndex, value) => {
    setReflections(prev => ({
      ...prev,
      [`${dimensionId}-${questionIndex}`]: value
    }))
  }

  const getSelectedQuestions = () => {
    const questions = []
    selectedDimensions.forEach(dimId => {
      const dim = blindspotDimensions.find(d => d.id === dimId)
      if (dim) {
        dim.questions.forEach((q, idx) => {
          questions.push({
            dimension: dim.name,
            icon: dim.icon,
            question: q,
            key: `${dimId}-${idx}`
          })
        })
      }
    })
    return questions
  }

  return (
    <div className="blindspot-scanner">
      <header className="scanner-header">
        <h1>🎯 盲点扫描器</h1>
        <p className="subtitle">在做出决策前，扫描潜在的思维盲点</p>
      </header>

      <section className="input-section">
        <label htmlFor="decision-input">你要做的决策或面临的问题是什么？</label>
        <textarea
          id="decision-input"
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
          placeholder="例如：我应该接受这份工作offer吗？"
          rows={3}
        />
        <button 
          className="scan-button"
          onClick={startScan}
          disabled={!decision.trim() || isScanning}
        >
          {isScanning ? '🔍 扫描中...' : '开始扫描'}
        </button>
      </section>

      {isScanning && (
        <section className="scanning-section">
          <div className="scanner-animation">
            <div className="scanner-ring"></div>
            <div className="scanner-ring"></div>
            <div className="scanner-ring"></div>
          </div>
          <p>正在分析决策盲区...</p>
        </section>
      )}

      {scanComplete && (
        <section className="dimensions-section">
          <h2>📋 选择需要关注的维度</h2>
          <p className="hint">点击选择你认为可能存在盲点的维度</p>
          <div className="dimensions-grid">
            {blindspotDimensions.map(dim => (
              <div
                key={dim.id}
                className={`dimension-card ${selectedDimensions.includes(dim.id) ? 'selected' : ''}`}
                onClick={() => toggleDimension(dim.id)}
              >
                <span className="dimension-icon">{dim.icon}</span>
                <h3>{dim.name}</h3>
                <p>{dim.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {selectedDimensions.length > 0 && (
        <section className="checklist-section">
          <h2>✅ 盲点检查清单</h2>
          <div className="checklist">
            {getSelectedQuestions().map((item, idx) => (
              <div key={item.key} className="checklist-item">
                <div className="question-header">
                  <span className="dimension-tag">
                    {item.icon} {item.dimension}
                  </span>
                </div>
                <p className="question-text">{item.question}</p>
                <textarea
                  className="reflection-input"
                  placeholder="写下你的思考..."
                  value={reflections[item.key] || ''}
                  onChange={(e) => {
                    const [dimId, qIdx] = item.key.split('-')
                    updateReflection(dimId, parseInt(qIdx), e.target.value)
                  }}
                  rows={2}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {selectedDimensions.length > 0 && (
        <section className="summary-section">
          <h2>📝 决策总结</h2>
          <div className="summary-card">
            <h3>原始决策</h3>
            <p className="summary-decision">{decision}</p>
            
            <h3>关注的盲点维度</h3>
            <div className="selected-dimensions">
              {selectedDimensions.map(dimId => {
                const dim = blindspotDimensions.find(d => d.id === dimId)
                return (
                  <span key={dimId} className="selected-tag">
                    {dim.icon} {dim.name}
                  </span>
                )
              })}
            </div>

            <h3>你的反思记录</h3>
            {Object.entries(reflections).filter(([_, v]) => v.trim()).length > 0 ? (
              <div className="reflections-list">
                {Object.entries(reflections)
                  .filter(([_, v]) => v.trim())
                  .map(([key, value]) => {
                    const [dimId] = key.split('-')
                    const dim = blindspotDimensions.find(d => d.id === dimId)
                    return (
                      <div key={key} className="reflection-item">
                        <span className="reflection-dim">{dim?.icon} {dim?.name}</span>
                        <p>{value}</p>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <p className="no-reflection">还没有记录反思，请在上方填写...</p>
            )}
          </div>
          
          <button 
            className="reset-button"
            onClick={() => {
              setDecision('')
              setScanComplete(false)
              setSelectedDimensions([])
              setReflections({})
            }}
          >
            🔄 开始新的扫描
          </button>
        </section>
      )}
    </div>
  )
}

export default App
