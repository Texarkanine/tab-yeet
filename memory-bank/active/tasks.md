# Task: Copy formats and automation scripts UI

* Task ID: 20260414-copy-formats-automation
* Complexity: Level 2
* Type: Simple enhancement (rework: automation scripts as bundled files)

Rework the automation scripts delivery: replace inline JS string constants (`lib/automation-scripts.js`) with real bundled files (`.ahk` script, `.html` description fragments) and a registry module. The options page dynamically builds tabs/panels from the registry and fetches content from the extension bundle at runtime. Copy format work (formats module, popup labels) is unchanged.

## Test Plan (TDD)

### Behaviors to Verify

- Registry exports a `PLATFORMS` array with `id`, `label`, `descriptionPath` for every entry
- Windows platform entry has a non-empty `scriptPath`
- Linux/macOS entries have no `scriptPath`
- `initAutomationScriptsTabs` (now async) builds tab buttons from registry and activates the first
- Clicking a tab hides other panels and shows the clicked panel
- Description HTML is fetched and injected into the panel
- Script content is fetched and placed in a read-only textarea when `scriptPath` is present
- Panels without `scriptPath` do not contain a textarea
- `initAutomationScriptsTabs` is a no-op for a null/missing container
- Existing format/popup/rule tests remain unchanged (no regressions)

### Test Infrastructure

- Framework: Vitest (see `package.json`)
- Test locations:
  - `test/automation-scripts/registry.test.js` (new — replaces `test/lib/automation-scripts.test.js`)
  - `test/options/options.test.js` (modify `initAutomationScriptsTabs` describe block)
- Conventions: ES modules, jsdom, `browser.runtime.getURL` already mocked in `test/setup.js`; add `fetch` mocking per test

## Implementation Plan

1. **Create script & description files** — `automation-scripts/`
   - `automation-scripts/windows/clipboard-yeet.ahk` — extract verbatim from current `WINDOWS_CLIPBOARD_YEET_AHK` constant
   - `automation-scripts/windows/description.html` — HTML fragment with AHK v2 docs link
   - `automation-scripts/linux/description.html` — `<p class="coming-soon">Coming soon...?</p>`
   - `automation-scripts/macos/description.html` — same

2. **Create registry module** — `automation-scripts/registry.js`
   - Export `PLATFORMS` array: `[{ id, label, descriptionPath, scriptPath? }]`
   - Three entries: windows (with `scriptPath`), linux, macos

3. **Rewrite `initAutomationScriptsTabs`** — `options/options.js`
   - Import `PLATFORMS` from `../automation-scripts/registry.js` (replaces `lib/automation-scripts.js` import)
   - Make async: builds tab buttons + panel containers dynamically from `PLATFORMS`
   - Fetch description HTML via `fetch(browser.runtime.getURL(descriptionPath))`, inject with `DOMParser` (CSP/lint-safe)
   - If `scriptPath` present: fetch text, create `<textarea readonly>`, fill with content
   - Wire tab click → show/hide panels
   - Update auto-init code at bottom of file: new container ID, add `.catch()` for the now-async call
   - Remove old `windows` parameter — content comes from fetched files, not JS imports

4. **Simplify `options/options.html`**
   - Replace the entire hardcoded tablist + three panel divs with a single `<div id="automation-container"></div>` 
   - Keep the `<section>` wrapper, heading, and lead paragraph

5. **Update Chrome staging** — `scripts/stage-chrome.js`
   - Add `"automation-scripts"` to `SOURCE_DIRS`

6. **Delete `lib/automation-scripts.js`**

7. **Update tests**
   - Delete `test/lib/automation-scripts.test.js`
   - Create `test/automation-scripts/registry.test.js` — verify `PLATFORMS` shape, IDs, paths
   - Rewrite `initAutomationScriptsTabs` tests in `test/options/options.test.js` — mock `fetch` to return description HTML and script text; assert DOM structure, tab switching, textarea content

8. **Documentation updates**
   - `memory-bank/systemPatterns.md` — update `lib/automation-scripts.js` reference to `automation-scripts/` directory

## Technology Validation

No new technology — `fetch` + `browser.runtime.getURL` are standard WebExtension APIs already available in the runtime. `DOMParser` is standard DOM API. Validation not required.

## Dependencies

- None (vanilla ESM, standard Web APIs)

## Challenges & Mitigations

- **`web-ext lint` flagging `innerHTML`**: Use `DOMParser` + `node.append(...childNodes)` instead of `innerHTML` for injecting fetched HTML. CSP-safe and lint-safe.
- **Chrome staging picking up `.html` fragments**: `injectShimScript` only matches `<script type="module">` — fragments without module scripts pass through unchanged. No issue.
- **Test `fetch` mocking**: Mock `globalThis.fetch` in each test with `vi.fn()` returning appropriate responses for the description/script URLs.

## Status

- [x] Initialization complete
- [x] Test planning complete (TDD)
- [x] Implementation plan complete
- [x] Technology validation complete
- [x] Preflight
- [x] Build
- [ ] QA
