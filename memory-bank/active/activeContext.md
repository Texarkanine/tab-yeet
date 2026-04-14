# Active Context

**Current Task:** Copy format variants + Automation scripts options section (rework)

**Phase:** BUILD — COMPLETE

**What Was Done**

- Extracted AHK script to `automation-scripts/windows/clipboard-yeet.ahk` (real file with proper syntax highlighting)
- Created HTML description fragments for each platform in `automation-scripts/<platform>/description.html`
- Created `automation-scripts/registry.js` with `PLATFORMS` array driving dynamic tab/panel construction
- Rewrote `initAutomationScriptsTabs` in `options/options.js` to be async, registry-driven, using `fetch(browser.runtime.getURL())` + `DOMParser`
- Simplified `options/options.html` from 90+ lines of hardcoded tabs/panels to a single `<div id="automation-container">`
- Updated `scripts/stage-chrome.js` to include `automation-scripts` in Chrome build
- Deleted `lib/automation-scripts.js` and its test; created `test/automation-scripts/registry.test.js`
- Updated `systemPatterns.md` to document new architecture

**Verification:** 90 tests pass (was 82), `web-ext lint` clean, Chrome build succeeds.

**Next Step:** QA review.
