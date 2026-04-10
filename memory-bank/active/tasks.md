# Task: CI Dual-Target Build Validation on PRs

* Task ID: m2-ci-dual-target
* Complexity: Level 2
* Type: Simple Enhancement

Update `ci.yaml` to build and lint both Firefox MV2 and Chrome MV3 targets on PRs, uploading both as separate artifacts. Also update the npm script aliases (`lint:ext`, `build:ext`, `ci`) so developer-facing scripts cover both targets.

## Test Plan (TDD)

### Behaviors to Verify

This milestone changes only CI configuration (YAML) and npm script aliases (JSON). No new application logic is introduced — the underlying `lint:firefox`, `lint:chrome`, `build:firefox`, and `build:chrome` scripts were implemented and tested in M1 (10 tests, all passing). CI workflow correctness is validated by execution, not unit tests.

Validation steps (run locally to confirm no regressions):

- B1: `npm test` passes (existing 67 tests)
- B2: `npm run lint:firefox` exits 0
- B3: `npm run lint:chrome` exits 0
- B4: `npm run build:firefox` produces `web-ext-artifacts/*.xpi`
- B5: `npm run build:chrome` produces `web-ext-artifacts/*-chrome.zip`
- B6: `npm run lint:ext` runs both Firefox and Chrome lints (updated alias)
- B7: `npm run build:ext` runs both Firefox and Chrome builds (updated alias)

### Test Infrastructure

- Framework: Vitest (existing)
- Test location: `test/`
- Conventions: mirror source tree under `test/`, `*.test.js` suffix
- New test files: none (no testable application code)

## Implementation Plan

1. **Update npm script aliases in `package.json`**
   - Files: `package.json`
   - Changes:
     - `lint:ext`: change from `npm run lint:firefox` to `npm run lint:firefox && npm run lint:chrome`
     - `build:ext`: change from `npm run build:firefox` to `npm run build:firefox && npm run build:chrome`
     - `ci`: add `npm run lint:chrome` (currently missing Chrome lint)

2. **Update CI workflow for dual-target build+lint**
   - Files: `.github/workflows/ci.yaml`
   - Changes:
     - Replace single `npm run lint:ext` step with two explicit steps: `npm run lint:firefox`, `npm run lint:chrome`
     - Replace single `npm run build:ext` step with two explicit steps: `npm run build:firefox`, `npm run build:chrome`
     - Replace single artifact upload with two: `tab-yeet-firefox` (`web-ext-artifacts/*.xpi`) and `tab-yeet-chrome` (`web-ext-artifacts/*-chrome.zip`)

3. **Validate locally**
   - Run `npm test` — all 67 tests pass
   - Run `npm run lint:ext` — both lints succeed
   - Run `npm run build:ext` — both artifacts produced
   - Verify `web-ext-artifacts/` contains both `.xpi` and `-chrome.zip`

4. **Update README if needed**
   - Files: `README.md`
   - Check if CI badge or build instructions reference the old artifact name; update if so

## Technology Validation

No new technology — validation not required.

## Dependencies

- M1 build scripts (`lint:firefox`, `lint:chrome`, `build:firefox`, `build:chrome`, `stage:chrome`) — all implemented and tested

## Challenges & Mitigations

- **Chrome lint limitations**: `web-ext lint` is Firefox-centric and won't catch Chrome-specific issues (per L4 preflight advisory #2). This is acceptable — Chrome validation happens at CWS upload. No mitigation needed.
- **Staging redundancy**: `lint:chrome` and `build:chrome` both call `stage:chrome`. Running lint then build stages twice. Acceptable for CI — correctness over speed.
- **Artifact name change**: Renaming `tab-yeet-extension` to `tab-yeet-firefox` + `tab-yeet-chrome` may affect anyone downloading CI artifacts by name. Since this is a pre-1.0 project on a feature branch, no external consumers exist.

## Status

- [x] Initialization complete
- [x] Test planning complete (TDD)
- [x] Implementation plan complete
- [x] Technology validation complete
- [x] Preflight (PASS — one advisory: `build:ext` change also affects `release-please.yaml`, benign since Chrome zip is produced but not consumed until M3)
- [x] Build (2/4 files changed: `package.json`, `.github/workflows/ci.yaml`; 67 tests pass; both artifacts verified)
- [ ] QA
