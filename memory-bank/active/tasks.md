# Task: Codecov coverage upload and README badge

* Task ID: 20260801-codecov-coverage-badge
* Complexity: Level 2
* Type: simple enhancement

Add Vitest coverage generation, upload reports from CI to Codecov using the existing `CODECOV_TOKEN` secret, and surface a Codecov badge on the README. Confirmed no existing Codecov/coverage steps in `.github/workflows/` (only plain `npm test`).

## Test Plan (TDD)

### Behaviors to Verify

- Package scripts: `package.json` defines `test:coverage` that invokes Vitest with `--coverage` → script string contains `vitest` and `--coverage`
- Local CI parity: `package.json` `ci` script invokes `test:coverage` (not only plain `test`) → local `npm run ci` generates coverage like CI
- Vitest coverage config: `vitest.config.js` enables v8 coverage with `lcov` reporter and includes extension/source JS under `lib/`, `popup/`, `options/`, `scripts/`, `automation-scripts/` → config exports those settings; excludes `test/`, `node_modules/`, `build/`, `web-ext-artifacts/`, `coverage/`
- CI triggers: `.github/workflows/ci.yaml` runs on `pull_request` **and** `push` to `main` → default-branch uploads keep the Codecov badge current
- CI upload: workflow runs coverage tests and uploads via `codecov/codecov-action` with `secrets.CODECOV_TOKEN` → YAML contains those markers; no duplicate upload steps
- Ignore artifact: `.gitignore` excludes `coverage/` → directory not tracked

### Edge Cases

- Duplicate work: assert exactly one Codecov upload step in the PR/main CI workflow
- Secret name must be exactly `CODECOV_TOKEN` (repo already has it)

### Docs (no automated tests)

- README Codecov badge for `Texarkanine/tab-yeet` — user-facing prose; verified in build/QA by inspection, not a Vitest change-detector

### Test Infrastructure

- Framework: Vitest (existing)
- Test location: `test/`
- Conventions: `test/<area>/<name>.test.js`; describe/it/expect
- New test files: `test/tooling/coverage-ci.test.js` (config/workflow/gitignore contracts only)

## Implementation Plan

1. **Stub then implement failing contract tests** for scripts, vitest coverage config, CI triggers + upload, and `.gitignore` (not README)
   - Files: `test/tooling/coverage-ci.test.js` (new)
   - Changes: read files via `fs` / `path`; assert load-bearing markers
2. **Add `@vitest/coverage-v8` and `test:coverage` script; update `ci` script to use coverage**
   - Files: `package.json`, `package-lock.json`
   - Changes: devDependency; `"test:coverage": "vitest run --coverage"`; `ci` uses `npm run test:coverage`
3. **Configure Vitest coverage** (v8, text+html+lcov reporters, include source dirs, exclude tests/build/artifacts)
   - Files: `vitest.config.js`
   - Changes: `test.coverage` block
4. **Wire CI**: trigger on PR and push to `main`; replace plain `npm test` with `npm run test:coverage`; add `codecov/codecov-action@v7` with `token: ${{ secrets.CODECOV_TOKEN }}` and `fail_ci_if_error: false`
   - Files: `.github/workflows/ci.yaml`
5. **Ignore coverage output; add README badge** (docs)
   - Files: `.gitignore`, `README.md`
6. **Run contract tests + full suite** until green; confirm `coverage/lcov.info` generated locally via `npm run test:coverage`

## Technology Validation

- `@vitest/coverage-v8@^4.1.10`: temporary install + `vitest run --coverage` succeeded (text report). Default reporters alone did not emit `lcov.info` — confirms need for explicit `lcov` reporter. Lockfile reverted for clean TDD build. Validation: PASS.

## Dependencies

- New: `@vitest/coverage-v8` (devDependency)
- Existing: Vitest, GitHub Actions, `CODECOV_TOKEN` secret (operator-confirmed present)
- Reference pattern: `../inquirerjs-checkbox-search` (vitest coverage + codecov-action + README badge)

## Challenges & Mitigations

- Badge stale / empty if only PR CI uploads: Mitigation — also run CI on `push` to `main` (preflight amendment)
- Codecov flake blocking PRs: Mitigation — `fail_ci_if_error: false`
- Over-broad coverage include: Mitigation — explicit `include` for extension/source JS only
- README badge test as change-detector: Mitigation — removed from test plan (docs-only)

## Pre-Mortem

- Plan failed because CI already uploaded coverage and we duplicated steps: Ruled out by scan; contract asserts a single upload step
- Plan failed because badge never showed on main: Addressed by push-to-main trigger
- Plan failed by adding thresholds that break CI at ~56% coverage: Out of scope; do not add thresholds

## Preflight Amendments (2026-08-01)

- Dropped README badge assertions from the TDD plan (document change-detector)
- Added `push` to `main` CI trigger so Codecov default-branch badge can update after merge

## Status

- [x] Initialization complete
- [x] Test planning complete (TDD)
- [x] Implementation plan complete
- [x] Technology validation complete
- [x] Pre-Mortem complete
- [x] Preflight
- [ ] Build
- [ ] QA
