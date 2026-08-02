# Task: Codecov coverage upload and README badge

* Task ID: 20260801-codecov-coverage-badge
* Complexity: Level 2
* Type: simple enhancement

Add Vitest coverage generation, upload reports from PR CI to Codecov using the existing `CODECOV_TOKEN` secret, and surface a Codecov badge on the README. Confirmed no existing Codecov/coverage steps in `.github/workflows/` (only plain `npm test`).

## Test Plan (TDD)

### Behaviors to Verify

- Package scripts: `package.json` defines `test:coverage` that invokes Vitest with `--coverage` → script string contains `vitest` and `--coverage`
- Vitest coverage config: `vitest.config.js` enables v8 coverage with `lcov` reporter and includes extension/source JS under `lib/`, `popup/`, `options/`, `scripts/`, `automation-scripts/` → config exports those settings
- CI upload: `.github/workflows/ci.yaml` runs coverage tests and uploads via `codecov/codecov-action` with `secrets.CODECOV_TOKEN` → workflow YAML contains those markers
- README badge: `README.md` links a Codecov badge for `Texarkanine/tab-yeet` → markdown badge present near the top
- Ignore artifact: `.gitignore` excludes `coverage/` → directory not tracked
- Local CI parity: `package.json` `ci` script uses coverage (not plain `npm test` alone) so local `npm run ci` matches PR test coverage generation

### Edge Cases

- Duplicate work: CI must not already contain a Codecov upload step (assert presence once; pre-check confirmed absence)
- Secret name must be exactly `CODECOV_TOKEN` (repo already has it)
- Coverage include must not pull in `test/`, `node_modules/`, `build/`, or `web-ext-artifacts/`

### Test Infrastructure

- Framework: Vitest (existing)
- Test location: `test/`
- Conventions: `test/<area>/<name>.test.js`; describe/it/expect; no parallel harness
- New test files: `test/tooling/coverage-ci.test.js` (contract tests over config/workflow/README — same style historically used for CI contracts in this repo)

## Implementation Plan

1. **Stub failing contract tests** for scripts, vitest coverage config, CI upload step, README badge, and `.gitignore`
   - Files: `test/tooling/coverage-ci.test.js` (new)
   - Changes: empty then implemented assertions reading files via `fs`
2. **Add `@vitest/coverage-v8` and `test:coverage` script; update `ci` script to use coverage**
   - Files: `package.json`, `package-lock.json`
   - Changes: devDependency; `"test:coverage": "vitest run --coverage"`; `ci` uses `npm run test:coverage`
3. **Configure Vitest coverage** (v8, text+html+lcov reporters, include source dirs, exclude tests/build/artifacts)
   - Files: `vitest.config.js`
   - Changes: `test.coverage` block
4. **Wire CI upload** after the test step: run `npm run test:coverage`, then `codecov/codecov-action@v7` with `token: ${{ secrets.CODECOV_TOKEN }}` and `fail_ci_if_error: false` (badge-friendly first uploads; matches reference)
   - Files: `.github/workflows/ci.yaml`
   - Changes: replace plain `npm test` with coverage run + upload step
5. **Ignore coverage output; add README badge**
   - Files: `.gitignore`, `README.md`
   - Changes: `coverage/`; Codecov badge markdown after title / before install links
6. **Run contract tests + full suite** until green; confirm `coverage/lcov.info` generated locally

## Technology Validation

- `@vitest/coverage-v8@^4.1.10` (peer of Vitest 4.1.10): temporary install + `vitest run --coverage` succeeded (text report) before lockfile was reverted for clean TDD build. Default reporters alone did not emit `lcov.info` — confirms the plan's need for an explicit `lcov` reporter in `vitest.config.js`. Validation: PASS.

## Dependencies

- New: `@vitest/coverage-v8` (devDependency)
- Existing: Vitest, GitHub Actions, `CODECOV_TOKEN` secret (operator-confirmed present)
- Reference pattern: `../inquirerjs-checkbox-search` (vitest coverage + codecov-action + README badge)

## Challenges & Mitigations

- Badge stays stale until first successful upload on a PR/main run: Mitigation — `fail_ci_if_error: false` so CI still green if Codecov briefly flakes; operator already has token
- Over-broad coverage include inflates noise: Mitigation — explicit `include` for extension/source JS only
- Contract tests become change-detectors if they assert prose: Mitigation — assert only load-bearing markers (script names, action name, secret name, badge URL host/repo path)

## Pre-Mortem

- Plan failed because CI already uploaded coverage and we duplicated steps: Ruled out by workspace scan of `.github/`; contract test locks single upload path
- Plan failed because we only changed README and forgot CI: Covered by Implementation steps 4–5 and contract tests requiring both
- Plan failed by adding thresholds that break CI at ~56% coverage: Out of scope; do not add thresholds

## Status

- [x] Initialization complete
- [x] Test planning complete (TDD)
- [x] Implementation plan complete
- [x] Technology validation complete
- [x] Pre-Mortem complete
- [ ] Preflight
- [ ] Build
- [ ] QA
