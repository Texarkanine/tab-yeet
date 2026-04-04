# Active Context

- **Current Task**: M1 — CI workflow and Dependabot (`cicd-m1-ci-dependabot`)
- **Phase**: PLAN - COMPLETE
- **What Was Done**: Level 2 plan written to `tasks.md`: add `web-ext` + npm scripts, `.gitignore` for `web-ext-artifacts/`, `.github/workflows/ci.yaml` (PR → Node 20 → `npm ci` / test / lint / build), `.github/dependabot.yaml` (npm + github-actions, weekly groups, reference-style commit prefixes). Technology validation: `npx web-ext@8` lint and build succeeded against current tree.
- **Next Step**: Preflight (`/niko-preflight` / Level 2 preflight skill), then Build.
