# Halfway Demos Project Status

## Basic Info

- Project name: halfway-demos
- Current path: `/Users/mac/Documents/Halfway-Lab/demos/halfway-demos`
- Repo type: standalone git repo inside the Halfway-Lab workspace
- Maintainer role: demo/tooling repo
- Relationship to HWP:
  - demo-facing usage of HWP tools and adapters

## Purpose

- What this project is for:
  - demo experiences, assets, and helper tools around HWP
- Primary users:
  - demo builders
  - internal experimentation
- Why it exists separately:
  - cleaner separation between protocol core and demo-specific artifacts

## Current Scope

- Main features:
  - `demos/`
  - `tools/`
  - `assets/`
  - repo-level README/docs
- Out-of-scope items:
  - protocol source ownership
- Current maturity:
  - active demo support repo in the Halfway-Lab workspace

## Entry Points

- Main README: `README.md`
- Main app/server entry:
  - demo-specific, to be confirmed from tools/scripts
- Main package entry:
  - not primary
- Main test entry:
  - not yet formalized in current quick scan

## Directory Notes

- Important directories:
  - `demos/`
  - `tools/`
  - `assets/`
  - `docs/`
- Generated directories:
  - none obvious from quick scan
- Sensitive/local-only files:
  - none confirmed yet

## Environment and Dependencies

- Runtime:
  - Node-based tooling and Vite demo app
- Package manager:
  - npm
- Required env files or secrets:
  - adapter/provider config may be used by tools
- External services/providers:
  - HWP-compatible adapters or APIs

## Current Commands

- Install:
  - `cd demos/question-expander && npm install`
- Dev:
  - `cd demos/question-expander && npm run dev`
- Build:
  - `cd demos/question-expander && npm run build`
- Test:
  - no dedicated test script captured in the current demo package
- Verify:
  - `npm run adapter`
  - `npm run adapter:live`
  - `npm run adapter:live:file`
  - `npm run adapter:replay`

## Current Risks

- Known issues:
  - current runbook not yet centralized enough
- Migration risks:
  - demo tools still carry some compatibility fallbacks for older local paths
- Path or config coupling:
  - active defaults now point to `/Users/mac/Documents/Halfway-Lab/protocol/HWP`
  - adapter scripts still keep legacy fallback candidates for observation safety
  - replay examples still depend on local chain-log availability

## Next Development Step

- Highest-priority next task:
  - keep reducing legacy fallback assumptions while preserving a safe rollback path during observation
- What should happen right after migration:
  - continue testing tool-to-protocol path references from the new workspace

## Notes

- Old `/Users/mac/Documents/halfway-demos` should now be treated as a fallback path only.
