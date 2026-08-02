# Task: Lean Firefox XPI + investigate store publish failures

* Task ID: 20260802-lean-xpi-publish-investigate
* Complexity: Level 2
* Type: Simple enhancement + investigation

Exclude non-runtime `screenshots/` and `docs/` from Firefox/`web-ext` packages, lock the contract with tests, and determine root causes of the 0.9.0 AMO/CWS publish failures (in-repo fixes only where justified).

## Test Plan (TDD)

### Behaviors to Verify

- [Ignore screenshots]: `web-ext-config.cjs` `ignoreFiles` includes both `screenshots` and `screenshots/**` → Firefox build omits that tree
- [Ignore docs]: `web-ext-config.cjs` `ignoreFiles` includes both `docs` and `docs/**` → Firefox build omits that tree
- [Built XPI lean]: After `web-ext build` from repo root → resulting `.xpi` zip entries do not include any path under `screenshots/` or `docs/`
- [Runtime paths retained]: Built `.xpi` still contains `manifest.json`, `popup/`, `options/`, `lib/`, `icons/`, `automation-scripts/`, and `LICENSE`
- [Edge — ignore pattern shape]: Directory-only ignores follow the established `dir` + `dir/**` pair pattern used for `coverage/` (web-ext does not match directory entries via `dir/**` alone)
- [Publish investigation — documented]: Progress/reflection records distinct root causes for AMO `unsupported_filetype` vs CWS `invalid_grant`, with operator vs in-repo remediation called out

### Test Infrastructure

- Framework: Vitest (`npm test` / `vitest.config.js`)
- Test location: `test/tooling/`
- Conventions: Root-relative `readFileSync` helpers; describe blocks name the contract; existing coverage ignore pattern in `test/tooling/coverage-ci.test.js`
- New test files: `test/tooling/web-ext-package.test.js` (config + build artifact assertions)

## Implementation Plan

1. **Stub & implement package contract tests (failing)**
   - Files: `test/tooling/web-ext-package.test.js` (new)
   - Changes: Assert `ignoreFiles` markers for `screenshots`/`docs`; run/build or use a focused build helper to assert the produced XPI zip listing excludes those trees and retains runtime paths + `LICENSE`

2. **Exclude non-runtime trees from web-ext packages**
   - Files: `web-ext-config.cjs`
   - Changes: Add `screenshots`, `screenshots/**`, `docs`, `docs/**` to `ignoreFiles` (same pair pattern as `coverage`)

3. **Investigate AMO `unsupported_filetype` (run 30728594885 attempt 2)**
   - Files: `.github/workflows/release-please.yaml`, release asset `tab_yeet-0.9.0.xpi`, logs; optionally `texarkanine/action-web-ext@submit-timeout` behavior notes in `progress.md`
   - Changes: Trace submit path (`source: amo-submit/unsigned.xpi` + metadata). Evaluate whether AMO/`web-ext sign` expects a source directory (or `.zip`) rather than a pre-built `.xpi` — web-ext docs emphasize signing from source and ignoring nested archives. Determine whether rejection is packaging/upload path, validator quirk, or credentials/version conflict. Apply an in-repo workflow/packaging fix only if evidence supports one; otherwise document operator/AMO-side next steps in `progress.md`
   - TDD if workflow changes: Before editing `release-please.yaml`, add/extend a Vitest contract in `test/tooling/` that locks the corrected AMO submit shape (same style as `coverage-ci.test.js`)

4. **Investigate CWS `invalid_grant`**
   - Files: `docs/cws-setup.md`, workflow CWS env/secrets usage
   - Changes: Confirm OAuth refresh failure (not zip contents). Document remediation (re-consent / rotate `CWS_*` secrets) in `docs/cws-setup.md` if a troubleshooting gap exists; no fake “code fix” for expired tokens. Docs-only — no executable-behavior tests required

5. **Verify end-to-end locally**
   - Files: none (commands)
   - Changes: `npm test`, `npm run build:firefox`, confirm XPI size/listing; full suite before done

## Technology Validation

No new technology - validation not required

## Dependencies

- Existing `web-ext` / Vitest tooling
- GitHub Actions logs and release assets for 0.9.0 (read-only investigation)
- Operator action required for CWS secret rotation if investigation confirms `invalid_grant`

## Challenges & Mitigations

- **AMO filetype error may be unrelated to screenshots bloat**: Treat lean packaging and AMO root-cause as separate outcomes; do not claim the ignore fix “fixes AMO” without evidence
- **Build-in-test may be slow or flake on path/cwd**: Prefer deterministic temp `artifacts-dir`; mirror `npm run build:firefox` flags; keep assertion on zip listing not byte size
- **CWS credentials are outside the repo**: Document operator steps; do not invent workflow hacks that hide `invalid_grant`
- **web-ext ignore glob quirks**: Always add both directory and `/**` forms (already documented in config comments)

## Pre-Mortem

- **Assumed screenshots caused AMO rejection, shipped ignore-only, publish still fails**: Plan already separates investigation; build step must leave an explicit AMO finding even if packaging is fixed
- **Contract tests only string-match config while ignore patterns are wrong for web-ext**: Mitigated by requiring a built-XPI listing assertion, not config-only
- **Investigation expands into redesigning dual-target staging**: Scope cut — ignore-list hygiene for Firefox only; no Chrome stage rewrite unless investigation proves it

## Status

- [x] Initialization complete
- [x] Test planning complete (TDD)
- [x] Implementation plan complete
- [x] Technology validation complete
- [x] Pre-Mortem complete
- [x] Preflight
- [x] Build
- [x] QA

## Preflight Amendments

- AMO investigation must evaluate source-dir / `.zip` vs pre-built `.xpi` submit shape (web-ext sign docs).
- Any `release-please.yaml` change requires a Vitest contract test written first.
