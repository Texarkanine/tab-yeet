# Active Context

## Current Task
Dual-Manifest Build System (M1)

## Phase
PLAN - COMPLETE

## What Was Done
- Surveyed codebase: manifest.json (MV2), package.json scripts, web-ext-config.cjs, CI workflows, test infrastructure
- Identified MV2→MV3 transform requirements: manifest_version, browser_action→action, remove browser_specific_settings, drop clipboardWrite
- Designed staging directory approach: `scripts/stage-chrome.js` copies extension files + transformed manifest to `build/chrome/`
- Planned npm script structure: `build:firefox`/`build:chrome` + `lint:firefox`/`lint:chrome`, with backwards-compat aliases for `build:ext`/`lint:ext`
- Decision: drop `clipboardWrite` from Chrome manifest (Clipboard API works without it in extension popups)
- 10 test behaviors identified for `transformManifest` pure function

## Next Step
Preflight validation will now run automatically.
