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

1. [x] Stub transform function + test file
2. [x] Implement tests for `transformManifest`
3. [x] Implement `transformManifest`
4. [x] Create staging script
5. [x] Update npm scripts
6. [x] Update `.gitignore`
7. [x] Verify both builds
8. [x] Update README

## Technology Validation

No new technology — validation not required. `web-ext` (already a dev dependency) supports `--source-dir` for both lint and build, and CLI args override config file values.

## Dependencies

- `web-ext` (existing) — used for both Firefox and Chrome lint/build
- Node.js `fs` module — for staging script file operations

## Challenges & Mitigations

- **`web-ext-config.cjs` applies to Chrome builds**: The config is CWD-based, so Chrome builds inherit Firefox ignore patterns and `.xpi` filename. Mitigation: harmless extra ignores; override filename via `--filename` CLI arg.
- **`web-ext lint` Chrome limitations** (from L4 preflight): `web-ext lint` validates Firefox-centric rules. Reports `ADDON_ID_REQUIRED` error for Chrome MV3 manifests (Firefox-specific requirement). Chrome lint excluded from CI; Chrome validation happens at CWS upload time.
- **`clipboardWrite` decision**: Dropped from Chrome manifest since Clipboard API works in extension popups without it. Documented in transform function.

## Status

- [x] Initialization complete
- [x] Test planning complete (TDD)
- [x] Implementation plan complete
- [x] Technology validation complete
- [x] Preflight
- [x] Build
- [x] QA
