# Active Context

**Current Task:** Codecov coverage upload and README badge
**Phase:** BUILD - COMPLETE
**What Was Done:** Implemented coverage tooling, CI upload (PR + push to main), README badge, gitignore + web-ext ignore for `coverage/`. 102 tests passing; lcov generated; lint clean; XPI excludes coverage.
**Next Step:** QA phase.

## Files created or modified

- `/home/mobaxterm/git/tab-yeet/test/tooling/coverage-ci.test.js` (new)
- `/home/mobaxterm/git/tab-yeet/vitest.config.js`
- `/home/mobaxterm/git/tab-yeet/package.json`
- `/home/mobaxterm/git/tab-yeet/package-lock.json`
- `/home/mobaxterm/git/tab-yeet/.github/workflows/ci.yaml`
- `/home/mobaxterm/git/tab-yeet/.gitignore`
- `/home/mobaxterm/git/tab-yeet/README.md`
- `/home/mobaxterm/git/tab-yeet/web-ext-config.cjs`

## Key decisions

- `fail_ci_if_error: false` on codecov-action
- CI renamed workflow display name to "CI"; triggers PR + push to main
- Exclude `coverage` from web-ext (required so local `test:coverage` then lint/build does not ship reports)

## Deviations

- Extra web-ext ignore + contract test beyond original plan steps (caught during build verification)
