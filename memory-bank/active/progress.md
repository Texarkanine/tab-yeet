# Progress: Release Pipeline — CWS Publishing & Dual-Target Artifacts (M3)

Extend release-please pipeline to build both Firefox MV2 and Chrome MV3 targets on release, attach both to GitHub releases, add CWS publish job, update release-please config for dual-manifest version tracking, and document CWS developer account + Google Cloud OAuth2 setup + repo secrets.

**Complexity:** Level 3

## Phase History

- **COMPLEXITY-ANALYSIS**: Complete. Level 3 determined — multiple CI/CD files, new CWS publishing target, documentation deliverable, cross-cutting release pipeline concerns.
- **PLAN**: Complete. 6-step plan: rename build job + attach Chrome zip, stage CWS artifact, add CWS publish job, update README, create CWS setup docs, verify RP config (no-op). No open questions. No unit tests (pure CI/CD + docs). Key decisions: direct curl for CWS API, conditional job, separate docs/cws-setup.md.
