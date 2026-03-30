# Halfway Demos Runbook

## Question Expander Demo Commands

- `cd demos/question-expander`
- install: `npm install`
- dev: `npm run dev`
- build: `npm run build`
- preview: `npm run preview`
- verify helpers:
  - `npm run adapter`
  - `npm run adapter:live`
  - `npm run adapter:live:file`
  - `npm run adapter:replay`

## Migration Warnings

- `adapter:live` and `adapter:replay` currently hardcode `/Users/mac/Documents/HWP`
- `tools/question-expander-adapter.mjs` and `demos/question-expander/tools/llm-agent-bridge.mjs` default to `/Users/mac/Documents/HWP`
- these paths should be parameterized before or immediately after the move
