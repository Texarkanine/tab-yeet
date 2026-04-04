# Tasks: cicd-pipeline

CI/CD pipeline for Tab Yeet extension — CI, release-please, AMO submission, and dependabot.

## Preflight Findings

- **PASS**: All 3 milestones are well-scoped, independently deliverable, and have clear implementation paths.
- **Convention**: Use `.yaml` extension for all GitHub workflow files (matches reference project).
- **Incorporated**: Add `web-ext` as devDependency and `lint:ext`/`build:ext` npm scripts in M1 for local-CI parity.
- **Advisory**: Listed AMO extensions go through async human review — M3 should handle the case where the signed `.xpi` is not immediately available (submit and log, attach only if signing completes within the workflow timeout).
