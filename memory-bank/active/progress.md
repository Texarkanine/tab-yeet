# Progress: M2 — Release-please CD pipeline

Implement release-please (Node), dual version bump in `package.json` and `manifest.json`, changelog from Conventional Commits, GitHub Release with unsigned `.xpi` attachment, package-lock update workflow for release PRs, and GitHub App token pattern aligned with jekyll-mermaid-prebuild.

**Complexity:** Level 2

## Phase History

- **COMPLEXITY-ANALYSIS**: Complete. M2 classified Level 2: CI/CD and release configuration, reference-aligned workflows, no product architecture change.
- **PLAN**: Complete. `memory-bank/active/tasks.md` populated with TDD framing, ordered steps, and reference alignment (jekyll-mermaid-prebuild).
- **PREFLIGHT**: PASS. Tooling test location and scope match repo conventions; advisory recorded for verifying manifest bump config against release-please docs on first run.
