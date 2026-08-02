---
task_id: 20260801-codecov-coverage-badge
complexity_level: 2
date: 2026-08-01
status: completed
---

# TASK ARCHIVE: Codecov coverage upload and README badge

## SUMMARY

Wired Vitest V8 coverage into local/CI workflows, upload coverage to Codecov with the existing `CODECOV_TOKEN`, and added a README Codecov badge. CI now runs coverage on pull requests and pushes to `main`. Coverage output is ignored by git and by `web-ext` so report HTML never lands in the Firefox XPI.

## REQUIREMENTS

- Generate coverage with Vitest (`@vitest/coverage-v8`) and emit `lcov` for Codecov
- Upload from CI via `codecov/codecov-action` and `secrets.CODECOV_TOKEN` (secret already present)
- Add a Codecov badge to the README
- Do not duplicate prior CI coverage work (none existed; CI ran plain `npm test` only)
- Follow the inquirerjs-checkbox-search pattern without Stryker or coverage thresholds

## IMPLEMENTATION

- **`package.json` / lockfile**: `@vitest/coverage-v8`; `test:coverage` (`vitest run --coverage`); `ci` invokes `test:coverage`
- **`vitest.config.js`**: v8 coverage with text/html/lcov reporters; include `lib/`, `popup/`, `options/`, `scripts/`, `automation-scripts/`; exclude tests/build/artifacts/coverage
- **`.github/workflows/ci.yaml`**: triggers on `pull_request` and `push` to `main`; coverage run + single `codecov/codecov-action@v7` step (`fail_ci_if_error: false`)
- **`.gitignore`**: `coverage/`
- **`web-ext-config.cjs`**: ignore `coverage` / `coverage/**` (build discovery: otherwise XPI packs report HTML)
- **`README.md`**: Codecov badge for `Texarkanine/tab-yeet`
- **`test/tooling/coverage-ci.test.js`**: contract tests for scripts, vitest coverage config, CI triggers/upload, gitignore, web-ext ignore
- **`memory-bank/techContext.md`**: Testing section updated for coverage/Codecov/web-ext ignore

## TESTING

- TDD contract suite in `test/tooling/coverage-ci.test.js` (7 tests)
- Full Vitest suite green (102 tests) after build
- Local `npm run test:coverage` produces `coverage/lcov.info`
- `/niko-preflight` PASS; `/niko-qa` PASS (semantic review + techContext sync)

## LESSONS LEARNED

- If CI runs `test:coverage` before `web-ext lint/build` with `--source-dir .`, `coverage/` must be in `web-ext-config.cjs` `ignoreFiles` or the XPI ships report HTML and lint floods with noise.
- Codecov README badges need a default-branch upload path; PR-only CI leaves the badge empty or stale.
- Default Vitest `--coverage` without an explicit `lcov` reporter may not emit `lcov.info`.

## PROCESS IMPROVEMENTS

- Preflight correctly forced the push-to-main trigger once the badge requirement was examined against PR-only CI.
- Drop README content from Vitest contract tests (change-detectors); verify badges by inspection in build/QA.

## TECHNICAL IMPROVEMENTS

- Coverage thresholds and raising suite percentages were deliberately out of scope; can be a later task once the badge establishes a baseline trend.

## NEXT STEPS

None for this task. Draft PR #42 (`coverage` → `main`) is the merge vehicle for the shipped changes.
