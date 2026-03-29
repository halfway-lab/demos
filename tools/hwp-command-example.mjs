import process from 'node:process'

let raw = ''

process.stdin.setEncoding('utf8')
process.stdin.on('data', chunk => {
  raw += chunk
})

process.stdin.on('end', () => {
  const payload = raw.trim() ? JSON.parse(raw) : {}
  const level = Math.max(1, Number(payload.depth) || 1)
  const parentPrefix = payload.parent_path_id || 'cmd'

  const paths = Array.from({ length: 3 }, (_, index) => ({
    id: level > 1 ? `${parentPrefix}-${level}-${index + 1}` : `cmd-${index + 1}`,
    path_title: level > 1
      ? `命令行第${level}层路径 ${index + 1}`
      : `命令行路径 ${index + 1}`,
    path_summary: `这是 command provider 的示例输出，可替换为真实 HWP 命令结果映射。`,
    next_question: level > 1
      ? `围绕第${level}层的「${payload.context?.parent_title || '这条路径'}」继续追问什么？`
      : `围绕「${payload.question || '这个问题'}」继续追问什么？`,
    branch_type: index === 0 ? 'premise_shift' : index === 1 ? 'hidden_variable' : 'unfinished_path',
    unfinished_score: Math.max(0.55, 0.82 - level * 0.03 + index * 0.04),
    blind_spot_hint: '这里展示的是 command provider 到前端 Path 结构的映射样例'
  }))

  process.stdout.write(JSON.stringify({ paths }))
})
