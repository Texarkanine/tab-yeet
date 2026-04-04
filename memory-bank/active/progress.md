# Progress: M1 — CI workflow and Dependabot

Add PR-gated GitHub Actions (Vitest, web-ext lint, web-ext build) and Dependabot for npm and GitHub Actions.

**Complexity:** Level 2

## Phase History

- **COMPLEXITY-ANALYSIS**: Complete. Milestone 1 classified as Level 2: DevOps scope (workflows + Dependabot), multiple new files under `.github/`, no extension architecture change.
- **PLAN**: Complete. `memory-bank/active/tasks.md` populated with TDD framing, ordered implementation steps, and `web-ext@8` POC results (lint/build).
- **PREFLIGHT**: PASS. Plan aligns with repo layout; no conflicting CI; npm + Dependabot config matches reference intent; advisory-only note to keep `web-ext` semver pinned deliberately in `package.json`.
