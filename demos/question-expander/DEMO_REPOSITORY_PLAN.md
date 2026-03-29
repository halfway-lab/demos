# Demo Repository Plan

## 结论

建议新开一个独立 repository，专门承载 Half Way / HWP 的对外交互 DEMO。

`question-expander-demo` 可以作为第一个正式收录的 demo。

这样做的好处：

- 展示目标更清楚，不会和主工程仓库混在一起
- 更适合对外发链接、收集反馈、持续加新 demo
- 主仓库继续聚焦底层能力，新仓库聚焦“可看、可讲、可体验”

## 仓库命名建议

### 推荐优先级

1. `halfway-demos`
2. `halfway-labs`
3. `hwp-demos`

### 命名判断

`halfway-demos`

- 最适合对外展示
- 品牌感更强
- 以后可以容纳多个不同方向的 demo

`halfway-labs`

- 更像实验室或原型集
- 适合持续放概念验证
- 但比 `demos` 稍微抽象一点

`hwp-demos`

- 更贴近底层体系
- 技术圈更容易理解
- 但产品感会弱一点

## 推荐目录结构

```text
halfway-demos/
├── README.md
├── demos/
│   ├── question-expander/
│   │   ├── README.md
│   │   ├── DEMO_BRIEF.md
│   │   ├── package.json
│   │   ├── index.html
│   │   ├── public/
│   │   ├── src/
│   │   └── vite.config.js
│   ├── pause-card/
│   └── decision-tree/
├── assets/
│   ├── screenshots/
│   └── gifs/
└── docs/
    ├── publishing-checklist.md
    └── repo-roadmap.md
```

## 首页 README 建议写法

下面这段可以直接作为新 repository 首页的第一版。

```md
# Half Way Demos

Interactive demos for thought expansion, reflective workflows, and structured human-AI collaboration.

This repository collects small but opinionated product demos built around one idea:

Instead of rushing to answer, help people unfold a question into better paths of thinking.

## Included demos

### Question Expander

Turn one sentence into multiple unfinished paths worth exploring.

- Multi-level expansion
- Pause-and-reflect checkpoints
- Markdown export of the explored branch
- Replay mode for stable demos
- Live mode for compatible LLM backends

Path: `demos/question-expander`

## Why this repository exists

The main product and protocol repos should stay focused on core capabilities.
This repo is for demos that are easy to open, explain, run, and share.

## Running a demo

See the README inside each demo folder for setup and launch instructions.
```

## `question-expander` 子目录 README 应该怎么定位

建议这个 demo 在新仓库里保留两层文档：

- `README.md`
  作用：对 GitHub 访问者说明这是什么、怎么运行、有哪些亮点
- `DEMO_BRIEF.md`
  作用：给内部演示、路演、口头介绍时快速参考

也就是说：

- `README.md` 偏公开说明
- `DEMO_BRIEF.md` 偏演示手卡

## 第一批建议收录的 demo

建议不要一开始就塞太多。

第一版新仓库只放：

1. `question-expander`

等仓库框架稳定后，再放：

1. `pause-card`
2. `reflection-loop`
3. `decision-tree`

## 迁移方案

### 方案 A：最推荐

新建一个干净仓库，把当前 demo 复制进去作为：

```text
demos/question-expander
```

优点：

- 最干净
- 不带旧仓库历史包袱
- 最适合做公开展示

### 方案 B：保留当前历史

从当前 demo 目录抽出一个独立仓库，并保留部分提交历史。

优点：

- 有演进记录

缺点：

- 更费整理时间
- 容易把当前主仓库上下文一起带过去

如果目标是“尽快发到 GitHub Demo 集”，优先建议方案 A。

## 最小迁移清单

新仓库创建后，先做下面这些：

1. 复制当前 demo 到 `demos/question-expander`
2. 带上 `README.md`、`DEMO_BRIEF.md`、`.env.live.example`
3. 确认不提交 `.env.live.local`
4. 首页 README 加一张截图或一个 gif
5. 在 demo README 里明确写：
   - 推荐演示模式是 `replay`
   - `live` 需要用户自己配置模型 key
6. 给仓库补一个简短描述

## GitHub 仓库描述建议

可以直接选下面这些中的一个：

1. `Interactive demos for thought expansion and reflective AI workflows.`
2. `Product demos for Half Way: expanding questions into deeper paths of thinking.`
3. `A collection of HWP demos for thought expansion, reflection, and structured exploration.`

## GitHub Topics 建议

建议加：

- `demo`
- `react`
- `vite`
- `llm`
- `ai-workflow`
- `thought-expansion`
- `human-ai`
- `prototype`

## 发布前 checklist

### 必做

- `.env.live.local` 不入库
- README 首屏说明这是 demo 集，不是主产品仓库
- `question-expander` README 说明 replay/live 的区别
- 至少准备 1 张截图

### 建议做

- 准备一个 15 到 30 秒短 gif
- 首页列出未来计划中的 demo
- 把 logo 和品牌命名统一为 `Half Way`

## 当前判断

从现在的完成度看，这个 demo 已经够资格作为新 demo 仓库里的第一个项目。

它已经具备：

- 清晰的演示主题
- 稳定的前端交互
- 可运行的 replay 模式
- 可扩展的 live 模式
- 可复制沉淀的 Markdown 输出

如果下一步要继续推进，最合理的顺序是：

1. 新建 demo repository
2. 迁移 `question-expander`
3. 补截图和首页文案
4. 再发布到 GitHub
