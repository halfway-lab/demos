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

## Current Path Behavior

- active live-file examples now use `/Users/mac/Documents/Halfway-Lab/protocol/HWP`
- `tools/question-expander-adapter.mjs` and `demos/question-expander/tools/llm-agent-bridge.mjs` prefer the new canonical HWP path
- legacy old-path fallbacks still remain in code for observation-period rollback safety
- replay examples still depend on a local chain log being present at the configured path
