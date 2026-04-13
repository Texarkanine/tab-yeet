# Progress: Release Pipeline — CWS Publishing & Dual-Target Artifacts (M3)

Extend release-please pipeline to build both Firefox MV2 and Chrome MV3 targets on release, attach both to GitHub releases, add CWS publish job, update release-please config for dual-manifest version tracking, and document CWS developer account + Google Cloud OAuth2 setup + repo secrets.

**Complexity:** Level 3

## Phase History

- **COMPLEXITY-ANALYSIS**: Complete. Level 3 determined — multiple CI/CD files, new CWS publishing target, documentation deliverable, cross-cutting release pipeline concerns.
- **PLAN**: Complete. 6-step plan: rename build job + attach Chrome zip, stage CWS artifact, add CWS publish job, update README, create CWS setup docs, verify RP config (no-op). No open questions. No unit tests (pure CI/CD + docs). Key decisions: direct curl for CWS API, conditional job, separate docs/cws-setup.md.
- **PREFLIGHT**: PASS. Two advisory items: (1) add proper error handling to CWS curl commands (incorporated into plan), (2) `secrets.*` in job `if:` condition is functionally correct but may log warnings — low risk, proceed as planned.
- **BUILD**: Complete. All 6 implementation steps executed to plan. Workflow file: renamed build job, dual-target GH Release attachments, CWS artifact staging, and conditional `cws-publish` job with full error handling. README updated. `docs/cws-setup.md` created. No unit test changes (pure CI/CD + docs). Existing 67 tests pass, lint clean, both builds succeed.
- **QA**: PASS. One finding: auth step used `curl -sf` which suppresses error response bodies; fixed to use the same `curl -s -w "\n%{http_code}"` pattern as upload/publish steps for consistent, diagnosable error handling. Re-verified: 67 tests, lint clean, both builds pass.
- **REFLECT**: Complete. Full lifecycle review performed. One technical insight: `curl -sf` suppresses error bodies in CI — use explicit HTTP code capture instead. No persistent file updates needed. Reflection document written.
