# Active Context

## Current Task
Dual-Manifest Build System (M1)

## Phase
BUILD - COMPLETE

## What Was Done
- Created `scripts/transform-manifest.js` with pure `transformManifest()` function (structuredClone for immutability)
- Created `test/scripts/transform-manifest.test.js` with 10 tests (6 core + 4 edge cases), all passing
- Created `scripts/stage-chrome.js` that assembles `build/chrome/` staging directory
- Updated `package.json`: added `stage:chrome`, `build:firefox`, `build:chrome`, `lint:firefox`, `lint:chrome` + backwards-compat aliases `build:ext`/`lint:ext`
- Updated `web-ext-config.cjs`: added `build/` and `scripts/` to ignoreFiles
- Updated `.gitignore`: added `build/`
- Updated `README.md`: dual-target build instructions, Chrome loading steps, build architecture explanation
- Discovered: `web-ext lint` reports `ADDON_ID_REQUIRED` for Chrome MV3 (Firefox-specific check). Excluded `lint:chrome` from CI; documented as expected limitation.

## Key Decisions
- Drop `clipboardWrite` from Chrome manifest (unnecessary for Clipboard API in extension popups)
- Use `structuredClone` for deep copy to guarantee no mutation of nested objects
- `lint:chrome` excluded from `ci` script due to Firefox-specific false positives
- Backwards-compat aliases: `build:ext` → `build:firefox`, `lint:ext` → `lint:firefox`

## Files Created/Modified
- `scripts/transform-manifest.js` (new)
- `scripts/stage-chrome.js` (new)
- `test/scripts/transform-manifest.test.js` (new)
- `package.json` (modified)
- `web-ext-config.cjs` (modified)
- `.gitignore` (modified)
- `README.md` (modified)

## Next Step
QA review will now run automatically.
