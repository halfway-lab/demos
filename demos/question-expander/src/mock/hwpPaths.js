/**
 * Mock 数据：更接近 HWP 风格的展开路径
 * 核心不是回答，而是把一句话分叉成多个未完成方向
 * 
 * v0.3 更新：支持二级路径展开 + branch_type 中文映射
 */

// branch_type 中英文映射表
export const branchTypeMap = {
  // 一级路径
  premise_shift: "前提转移",
  hidden_variable: "隐藏变量",
  unfinished_path: "未完成路径",
  // 二级路径 - 前提类
  premise_deconstruction: "假设剥离",
  premise_inversion: "前提反转",
  premise_context: "情境标定",
  // 二级路径 - 变量类
  variable_temporal: "时间维度",
  variable_relational: "关系网络",
  variable_threshold: "临界阈值",
  // 二级路径 - 路径类
  path_parallel: "平行路径",
  path_suspension: "主动悬置",
  path_meta: "元层反思",
  // 三级路径 - 深度探索
  deep_action: "行动拆解",
  deep_obstacle: "障碍预判",
  deep_resource: "资源盘点",
  deep_timing: "时机选择",
  deep_feedback: "反馈设计",
  // 四级路径 - 执行细化
  exec_step: "具体步骤",
  exec_metric: "衡量指标",
  exec_risk: "风险备案",
  exec_support: "支持系统"
};

// 获取中文标签
export const getBranchTypeLabel = (type) => branchTypeMap[type] || type;

// 一级路径展开
export const mockExpandPaths = (input) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          branch_type: "premise_shift",
          unfinished_score: 0.82,
          blind_spot_hint: "问题前提可能过早固定",
          path_title: "重写问题前提",
          path_summary: `先不急着解决「${input}」，而是检查这个说法默认了哪些前提。也许真正需要展开的，不是答案，而是问题本身的设定方式。`,
          next_question: "这个问题里，哪些前提是你暂时默认成立、但其实还没检查过的？"
        },
        {
          id: 2,
          branch_type: "hidden_variable",
          unfinished_score: 0.88,
          blind_spot_hint: "被忽略的变量尚未进入视野",
          path_title: "拉出隐藏变量",
          path_summary: `围绕「${input}」，先把那些还没被说出来、但会显著改变判断的变量拉出来。问题之所以卡住，可能不是因为没有答案，而是变量不完整。`,
          next_question: "如果把时间、资源、情境、关系这些变量一起放进来，问题会发生什么变化？"
        },
        {
          id: 3,
          branch_type: "unfinished_path",
          unfinished_score: 0.91,
          blind_spot_hint: "存在一条未被继续追问的分支",
          path_title: "保留未完成方向",
          path_summary: `不要急着收束「${input}」，而是保留一条暂时不求结论的方向。这个方向的价值，不在立刻可用，而在它可能打开新的理解路径。`,
          next_question: "如果现在不要求立刻得出结论，这个问题最值得继续追问的一条支线是什么？"
        }
      ])
    }, 600)
  })
}

// 二级路径展开 - 根据父路径ID生成对应的子路径
export const mockExpandSubPaths = (parentId, parentTitle) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const subPathsMap = {
        1: [ // 重写问题前提 的二级路径
          {
            id: `${parentId}-1`,
            branch_type: "premise_deconstruction",
            unfinished_score: 0.85,
            blind_spot_hint: "前提的假设层尚未剥离",
            path_title: "剥离假设层",
            path_summary: `从「${parentTitle}」继续深入，把问题里每个关键词的假设都列出来，看看哪些是可以质疑的。`,
            next_question: "如果去掉'必须'、'应该'这些隐含假设，问题会变成什么样？"
          },
          {
            id: `${parentId}-2`,
            branch_type: "premise_inversion",
            unfinished_score: 0.79,
            blind_spot_hint: "反向前提未被考虑",
            path_title: "反转前提",
            path_summary: `假设「${parentTitle}」的反面成立，探索这个反向视角会打开什么新的理解空间。`,
            next_question: "如果你完全不接受当前前提的反面，你会看到什么？"
          },
          {
            id: `${parentId}-3`,
            branch_type: "premise_context",
            unfinished_score: 0.88,
            blind_spot_hint: "前提的适用边界模糊",
            path_title: "标定边界",
            path_summary: `「${parentTitle}」在哪些情境下成立？在哪些情境下失效？明确边界本身就是展开。`,
            next_question: "这个问题的前提在什么情况下会完全失效？"
          }
        ],
        2: [ // 拉出隐藏变量 的二级路径
          {
            id: `${parentId}-1`,
            branch_type: "variable_temporal",
            unfinished_score: 0.86,
            blind_spot_hint: "时间维度被压平",
            path_title: "展开时间轴",
            path_summary: `「${parentTitle}」在不同时间尺度上会有什么不同表现？短期、中期、长期的变量可能互相矛盾。`,
            next_question: "三个月后看这个问题，哪些变量会变得更重要？"
          },
          {
            id: `${parentId}-2`,
            branch_type: "variable_relational",
            unfinished_score: 0.91,
            blind_spot_hint: "关系网络未显化",
            path_title: "绘制关系网",
            path_summary: `「${parentTitle}」涉及哪些利益相关方？每方的隐性诉求是什么？关系结构可能比问题本身更值得展开。`,
            next_question: "如果所有相关方都坦诚说出真实诉求，问题会变成什么样？"
          },
          {
            id: `${parentId}-3`,
            branch_type: "variable_threshold",
            unfinished_score: 0.83,
            blind_spot_hint: "临界点未被识别",
            path_title: "寻找临界点",
            path_summary: `「${parentTitle}」中哪些变量到达某个阈值会引发质变？找到这些临界点，就找到了干预的杠杆点。`,
            next_question: "哪个变量只要改变一点点，整个问题性质就会翻转？"
          }
        ],
        3: [ // 保留未完成方向 的二级路径
          {
            id: `${parentId}-1`,
            branch_type: "path_parallel",
            unfinished_score: 0.89,
            blind_spot_hint: "单线思维限制探索",
            path_title: "开启平行线",
            path_summary: `「${parentTitle}」不必是唯一方向。同时保留多条互不干扰的探索线，让问题空间自然生长。`,
            next_question: "如果同时追三条不同的线，它们之间会产生什么共振？"
          },
          {
            id: `${parentId}-2`,
            branch_type: "path_suspension",
            unfinished_score: 0.92,
            blind_spot_hint: "急于求成关闭可能",
            path_title: "主动悬置",
            path_summary: `有意识地不完成「${parentTitle}」，让问题保持开放状态。悬置本身就是一种创造性的张力。`,
            next_question: "如果故意不解决这个问题，它会如何继续发酵？"
          },
          {
            id: `${parentId}-3`,
            branch_type: "path_meta",
            unfinished_score: 0.87,
            blind_spot_hint: "对展开本身的反思缺失",
            path_title: "元层观察",
            path_summary: `跳出「${parentTitle}」本身，观察自己是如何展开这个问题的。元认知视角会暴露隐藏的展开模式。`,
            next_question: "你展开这个问题的方式，本身是否也是一种限制？"
          }
        ]
      }
      
      resolve(subPathsMap[parentId] || [])
    }, 500)
  })
}

// 三级路径展开 - 根据父路径ID生成对应的三级子路径
export const mockExpandThirdPaths = (parentId, parentTitle) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 为所有二级路径生成通用的三级展开
      const thirdPaths = [
        {
          id: `${parentId}-1`,
          branch_type: "deep_action",
          unfinished_score: 0.78,
          blind_spot_hint: "具体行动步骤模糊",
          path_title: "拆解为可执行动作",
          path_summary: `把「${parentTitle}」转化为具体的、可立即执行的最小行动单元。`,
          next_question: "如果要在这个方向上迈出最小的一步，具体要做什么？"
        },
        {
          id: `${parentId}-2`,
          branch_type: "deep_obstacle",
          unfinished_score: 0.85,
          blind_spot_hint: "潜在阻力未被识别",
          path_title: "预判关键障碍",
          path_summary: `「${parentTitle}」在推进过程中最可能遇到什么阻力？提前识别才能提前准备。`,
          next_question: "这个方向最可能在哪里卡住？卡住的信号是什么？"
        },
        {
          id: `${parentId}-3`,
          branch_type: "deep_resource",
          unfinished_score: 0.82,
          blind_spot_hint: "可用资源未盘点",
          path_title: "盘点现有资源",
          path_summary: `围绕「${parentTitle}」，你现在已经拥有哪些可以用上的资源、关系、能力？`,
          next_question: "如果现在就开始，你手头已经有什么可以用？"
        },
        {
          id: `${parentId}-4`,
          branch_type: "deep_timing",
          unfinished_score: 0.88,
          blind_spot_hint: "时机选择被忽视",
          path_title: "选择启动时机",
          path_summary: `「${parentTitle}」在什么时机启动最有利？有些方向需要等待，有些需要立即行动。`,
          next_question: "这个方向是越快开始越好，还是需要等待某个信号？"
        },
        {
          id: `${parentId}-5`,
          branch_type: "deep_feedback",
          unfinished_score: 0.80,
          blind_spot_hint: "反馈机制缺失",
          path_title: "设计反馈回路",
          path_summary: `如何知道「${parentTitle}」是否在正确的轨道上？建立早期反馈信号，避免盲目推进。`,
          next_question: "一周后，什么信号会告诉你这个方向是对的/错的？"
        }
      ]
      
      resolve(thirdPaths)
    }, 400)
  })
}

// 四级路径展开 - 根据父路径ID生成对应的四级子路径
export const mockExpandFourthPaths = (parentId, parentTitle) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 为所有三级路径生成通用的四级展开
      const fourthPaths = [
        {
          id: `${parentId}-1`,
          branch_type: "exec_step",
          unfinished_score: 0.75,
          blind_spot_hint: "执行步骤不清晰",
          path_title: "细化执行步骤",
          path_summary: `把「${parentTitle}」拆解为今天、明天、本周可以执行的具体动作。`,
          next_question: "今天你可以做的最小一步是什么？"
        },
        {
          id: `${parentId}-2`,
          branch_type: "exec_metric",
          unfinished_score: 0.82,
          blind_spot_hint: "成功标准模糊",
          path_title: "设定衡量指标",
          path_summary: `如何量化「${parentTitle}」的进展？定义清晰的指标，才能知道是否真的在推进。`,
          next_question: "做到什么程度，你会认为这个阶段成功了？"
        },
        {
          id: `${parentId}-3`,
          branch_type: "exec_risk",
          unfinished_score: 0.78,
          blind_spot_hint: "风险预案缺失",
          path_title: "制定风险备案",
          path_summary: `如果「${parentTitle}」失败了，Plan B 是什么？提前想好退路，才能大胆尝试。`,
          next_question: "如果这个方向走不通，你的备选方案是什么？"
        },
        {
          id: `${parentId}-4`,
          branch_type: "exec_support",
          unfinished_score: 0.80,
          blind_spot_hint: "支持系统未建立",
          path_title: "建立支持系统",
          path_summary: `推进「${parentTitle}」需要谁的支持？找到关键盟友，建立 accountability 机制。`,
          next_question: "谁会关心这个方向的进展？如何让他们参与进来？"
        }
      ]
      
      resolve(fourthPaths)
    }, 350)
  })
}

// 通用层级路径展开 - 支持任意层级
export const mockExpandPathsByLevel = (parentId, parentTitle, level = 1) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 根据层级生成不同的路径类型和内容
      const levelConfigs = {
        1: { // 问题层面
          types: ['premise_shift', 'hidden_variable', 'unfinished_path'],
          titles: ['重写问题前提', '拉出隐藏变量', '保留未完成方向'],
          hints: ['问题前提可能过早固定', '被忽略的变量尚未进入视野', '存在一条未被继续追问的分支']
        },
        2: { // 分析层面
          types: ['premise_deconstruction', 'variable_temporal', 'path_parallel'],
          titles: ['剥离假设层', '展开时间轴', '开启平行线'],
          hints: ['前提的假设层尚未剥离', '时间维度被压平', '单线思维限制探索']
        },
        3: { // 行动层面
          types: ['deep_action', 'deep_obstacle', 'deep_resource'],
          titles: ['拆解为可执行动作', '预判关键障碍', '盘点现有资源'],
          hints: ['具体行动步骤模糊', '潜在阻力未被识别', '可用资源未盘点']
        },
        4: { // 执行层面
          types: ['exec_step', 'exec_metric', 'exec_risk', 'exec_support'],
          titles: ['细化执行步骤', '设定衡量指标', '制定风险备案', '建立支持系统'],
          hints: ['执行步骤不清晰', '成功标准模糊', '风险预案缺失', '支持系统未建立']
        }
      }
      
      // 对于5层及以上，使用通用配置
      const defaultConfig = {
        types: [`level_${level}_a`, `level_${level}_b`, `level_${level}_c`],
        titles: [`第${level}层方向一`, `第${level}层方向二`, `第${level}层方向三`],
        hints: [`第${level}层盲点提示一`, `第${level}层盲点提示二`, `第${level}层盲点提示三`]
      }
      
      const config = levelConfigs[level] || defaultConfig
      const count = level <= 2 ? 3 : (level <= 4 ? 4 : 3) // 1-2层3个，3-4层4个，5+层3个
      
      const paths = []
      for (let i = 0; i < count; i++) {
        const typeIndex = i % config.types.length
        paths.push({
          id: `${parentId}-${i + 1}`,
          branch_type: config.types[typeIndex],
          unfinished_score: Math.max(0.5, 0.9 - (level - 1) * 0.05 - i * 0.02),
          blind_spot_hint: config.hints[typeIndex],
          path_title: config.titles[typeIndex],
          path_summary: `基于「${parentTitle}」深入探索第${level}层第${i + 1}个方向。`,
          next_question: `在${config.titles[typeIndex]}这个方向上，你最需要澄清的是什么？`
        })
      }
      
      resolve(paths)
    }, Math.max(200, 600 - level * 50)) // 层级越深，延迟越短
  })
}