# Question Expander

Question Expander is a product demo for unfolding one sentence into multiple unfinished paths of thought.

Instead of answering immediately, it helps people see:

- multiple directions worth exploring
- what remains unresolved
- what question should come next

![Question Expander screenshot](../../assets/screenshots/question-expander-home.png)

## Why It Exists

Most interfaces try to collapse uncertainty too early.

Question Expander takes the opposite approach: it keeps the question open long enough to surface better paths, blind spots, and next questions.

## What It Demonstrates

- multi-level path expansion
- pause-and-reflect checkpoints
- deep-branch focus mode
- Markdown export of the explored branch
- replay mode for stable presentations
- live mode for OpenAI-compatible LLM backends

## Best Use Cases

- internal product demos
- concept walkthroughs
- design critique around reflective interfaces
- experiments in structured human-AI thinking workflows

## Demo Flow

1. Type a question such as `我想提高工作效率`
2. Click `Expand`
3. Review the first-layer paths
4. Continue expanding one branch deeper
5. Use `停一下` to generate a midpoint reflection
6. Use `复制 Markdown` to export the currently opened branch

## Quick Start

For the most stable demo path, use replay mode.

### 1. Install

```bash
npm install
```

### 2. Start the adapter

```bash
npm run adapter:replay
```

### 3. Start the frontend

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## Run Locally

### Install

```bash
cd demos/question-expander
npm install
```

### Start the adapter

Recommended for demos: replay mode

```bash
npm run adapter:replay
```

Live mode with an OpenAI-compatible model:

```bash
cp .env.live.example .env.live.local
```

Fill in:

- `HWP_LLM_BASE_URL`
- `HWP_LLM_MODEL`
- `HWP_LLM_API_KEY`

Then run:

```bash
npm run adapter:live:file
```

### Start the frontend

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## Modes

### Replay

- best for demos
- stable output
- does not change in real time with each input

### Live

- real-time generation
- requires your own model configuration
- should be smoke-tested before external demos

## Recommended Demo Positioning

This is best presented as a concept demo or interaction prototype.

It is not meant to be framed as a general-purpose chatbot. The value is in how it expands a question into structured paths of thinking.

## Repository Notes

This demo lives inside the broader `Half Way Demos` repository.

Shared adapter scripts are kept in the repository-level `tools/` directory.
