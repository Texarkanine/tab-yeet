# Task: Copy formats and automation scripts UI

* Task ID: 20260414-copy-formats-automation
* Complexity: Level 2
* Type: Simple enhancement

Add five new clipboard format variants (alongside plain and existing Markdown links), human-readable labels in the popup selector, and an **Automation scripts** section on the options page with Windows (AHK script + doc link) and Linux/macOS placeholders.

## Test Plan (TDD)

### Behaviors to Verify

- [x] `markdown_url`: single tab → `- url`; ignores title for the line shape
- [x] `html_link`: `<a href="escaped-url">escaped-title</a>` per line
- [x] `html_ul_urls`: `<ul>` + one `<li>url</li>` per line + `</ul>`; empty tabs → `""`
- [x] `html_ul_links`: `<ul>` + `<li><a href="url">title</a></li>` per line + `</ul>`
- [x] Unknown format key still falls back to plain per line
- [x] `FORMAT_ORDER` drives popup options order and labels
- [x] Automation script export is non-empty and contains the hotkey line
- [x] Existing markdown and plain behavior unchanged

### Test Infrastructure

- Framework: Vitest (see `package.json`)
- Test location: `test/lib/formats.test.js`, `test/popup/popup.test.js`, `test/lib/automation-scripts.test.js`
- Conventions: ES modules, jsdom for DOM helpers

## Implementation Plan

1. **Formats module** — `lib/formats.js`
   - Add `escapeHtml`, line formatters (`markdown_url`, `html_link`), block formatters (`html_ul_urls`, `html_ul_links`)
   - Export `FORMAT_ORDER`, `FORMAT_LABELS`; extend `formatTabs` with block-format branch
2. **Automation constant** — `lib/automation-scripts.js`
   - Export `WINDOWS_CLIPBOARD_YEET_AHK`, `AUTOHOTKEY_V2_DOCS_URL`
3. **Popup** — `popup/popup.js`
   - Import `FORMAT_ORDER` / `FORMAT_LABELS`; fix `populateFormatSelect` and format preference validation
4. **Options** — `options/options.html`, `options/options.css`, `options/options.js`
   - Section below transform rules; tab UI; textarea filled from module; doc link; coming-soon panels
5. **Tests** — update `formats.test.js`, `popup.test.js`; add `automation-scripts.test.js`

## Technology Validation

No new technology — validation not required.

## Dependencies

- None (vanilla ESM)

## Challenges & Mitigations

- HTML escaping in titles/URLs: central `escapeHtml` for HTML outputs
- Block vs line formats: separate block formatters invoked from `formatTabs` by key

## Status

- [x] Initialization complete
- [x] Test planning complete (TDD)
- [x] Implementation plan complete
- [x] Technology validation complete
- [x] Preflight
- [x] Build
- [x] QA
