# Task: Dual-Manifest Build System (M1)

* Task ID: dual-manifest-build
* Complexity: Level 2
* Type: Simple Enhancement

Create a manifest transform script to generate a Chrome MV3 manifest from the existing Firefox MV2 `manifest.json`, add `build:firefox`/`build:chrome` npm scripts that produce separate extension packages, verify both with `web-ext lint`, and update README with dual-target development instructions.

## Test Plan (TDD)

### Behaviors to Verify

- `transformManifest`: MV2 input → output has `manifest_version: 3`
- `transformManifest`: `browser_action` key → renamed to `action` with identical content
- `transformManifest`: `browser_specific_settings` → removed from output
- `transformManifest`: `clipboardWrite` in permissions → removed (not needed for Clipboard API in Chrome MV3 popups)
- `transformManifest`: all other fields (name, version, description, remaining permissions, options_ui, icons) → preserved unchanged
- `transformManifest`: does not mutate the input object (pure function)
- Edge: manifest missing `browser_action` → no `action` key created, no error
- Edge: manifest missing `browser_specific_settings` → no error
- Edge: permissions without `clipboardWrite` → permissions unchanged, no error
- Edge: manifest missing permissions entirely → no error

### Test Infrastructure

- Framework: Vitest (configured in `vitest.config.js`)
- Test location: `test/` directory, mirrors source structure
- Conventions: `describe`/`it` blocks, direct imports, file named `*.test.js` matching source path
- New test files: `test/scripts/transform-manifest.test.js`

## Implementation Plan

1. **Stub transform function + test file**
   - Files: `scripts/transform-manifest.js`, `test/scripts/transform-manifest.test.js`
   - Changes: Export `transformManifest(mv2)` with empty implementation; create test file with empty `it()` blocks

2. **Implement tests for `transformManifest`**
   - Files: `test/scripts/transform-manifest.test.js`
   - Changes: Fill in all test cases per behaviors above; run tests → all should fail

3. **Implement `transformManifest`**
   - Files: `scripts/transform-manifest.js`
   - Changes: Implement MV2→MV3 conversion logic (manifest_version, browser_action→action, remove browser_specific_settings, remove clipboardWrite); run tests → all should pass

4. **Create staging script**
   - Files: `scripts/stage-chrome.js`
   - Changes: Script that creates `build/chrome/` with extension source files (popup/, options/, lib/, icons/) and transformed Chrome manifest

5. **Update npm scripts**
   - Files: `package.json`
   - Changes: Add `stage:chrome`, `build:firefox`, `build:chrome`, `lint:firefox`, `lint:chrome`; alias `build:ext`→`build:firefox`, `lint:ext`→`lint:firefox` for backwards compat; update `ci` to run both targets

6. **Update `.gitignore`**
   - Files: `.gitignore`
   - Changes: Add `build/` directory

7. **Verify both builds**
   - Run `npm run lint:firefox`, `npm run lint:chrome`, `npm run build:firefox`, `npm run build:chrome`
   - Confirm Firefox produces `.xpi`, Chrome produces `-chrome.zip`

8. **Update README**
   - Files: `README.md`
   - Changes: Update Development section for dual-target builds; note both Firefox and Chrome build commands

## Technology Validation

No new technology — validation not required. `web-ext` (already a dev dependency) supports `--source-dir` for both lint and build, and CLI args override config file values.

## Dependencies

- `web-ext` (existing) — used for both Firefox and Chrome lint/build
- Node.js `fs` module — for staging script file operations

## Challenges & Mitigations

- **`web-ext-config.cjs` applies to Chrome builds**: The config is CWD-based, so Chrome builds inherit Firefox ignore patterns and `.xpi` filename. Mitigation: harmless extra ignores; override filename via `--filename` CLI arg.
- **`web-ext lint` Chrome limitations** (from L4 preflight): `web-ext lint` validates Firefox-centric rules. It will accept MV3 manifests but won't catch Chrome-specific issues. Acceptable — Chrome validation happens at CWS upload time.
- **`clipboardWrite` decision**: Dropping it from Chrome manifest since Clipboard API works in extension popups without it. Documented in transform function.

## Status

- [x] Initialization complete
- [x] Test planning complete (TDD)
- [x] Implementation plan complete
- [x] Technology validation complete
- [ ] Preflight
- [ ] Build
- [ ] QA
