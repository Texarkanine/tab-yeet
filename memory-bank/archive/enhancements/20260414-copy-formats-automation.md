---
task_id: 20260414-copy-formats-automation
complexity_level: 2
date: 2026-04-14
status: completed
---

# TASK ARCHIVE: Copy formats and automation scripts UI

## SUMMARY

Delivered additional clipboard output formats (Markdown URL-only lines, HTML anchors per line, HTML `<ul>` blocks for URLs and links), human-readable labels in the popup format selector, and an **Automation scripts** section on the options page with Windows / Linux / macOS tabs.

A follow-up rework moved automation content out of inline JavaScript strings into bundled files under `automation-scripts/` (`.ahk` script, per-platform `description.html` fragments) with `automation-scripts/registry.js` driving dynamic tab and panel construction. Chrome staging copies the new directory.

Post-merge PR feedback refined link text when titles are blank (fallback to URL for markdown, `html_link`, and `html_ul_links`), replaced deprecated `clip` with `clip-path` on `.sr-only`, made `fetchExtensionFile` throw on non-OK responses, and synchronized roving `tabIndex` with tab activation for keyboard focus.

## REQUIREMENTS

- New copy formats alongside plain and existing Markdown links; `FORMAT_ORDER` / `FORMAT_LABELS` drive the popup.
- Options: Automation scripts below Transform rules; Windows shows AHK v2 script and documentation; Linux/macOS show “Coming soon...?”
- Pure `lib/formats.js`, centralized storage unchanged, Vitest TDD, no new runtime npm dependencies.
- Acceptance: popup lists formats and copies with transforms; tests cover formats and edge cases; options shows scripts and placeholders.

## IMPLEMENTATION

- **`lib/formats.js`**: `escapeHtml`, line formatters (`markdown_url`, `html_link`), block formatters (`html_ul_urls`, `html_ul_links`), `FORMAT_LABELS` / `FORMAT_ORDER`, `formatTabs` with block-format branch. Shared `linkLabelText(title, url)` for visible link label when title is empty/whitespace (fallback to URL), used in markdown, `html_link`, and `html_ul_links`.
- **`popup/popup.js`**: `populateFormatSelect` from registry; format preference validation against `FORMAT_ORDER`.
- **`automation-scripts/`**: `registry.js` (`PLATFORMS`), `windows/clipboard-yeet.ahk`, per-platform `description.html`; options loads via `fetch(browser.runtime.getURL(...))`, injects description HTML with `DOMParser`, appends read-only textarea when `scriptPath` is set; `aria-label` on textarea.
- **`options/options.{html,css,js}`**: `#automation-container` shell; async `initAutomationScriptsTabs`; non-OK fetch throws; `activate` sets `tab.tabIndex` roving 0 / -1.
- **`scripts/stage-chrome.js`**: `SOURCE_DIRS` includes `automation-scripts`.
- **Removed**: `lib/automation-scripts.js` (superseded by bundled files).
- **Docs**: `memory-bank/systemPatterns.md`, `techContext.md` updated for automation layout.

## TESTING

- Vitest: registry, formats, popup, options (including mocked `fetch`, tabindex, non-OK fetch rejection), integration and script tests as applicable.
- `npm run lint:firefox` clean; Chrome build verified after staging includes `automation-scripts/`.

## LESSONS LEARNED

- **Bundled resources**: Shipping scripts and HTML fragments as real files improves editing (syntax highlighting) and keeps the options module thin; a small registry avoids hardcoding tabs in HTML.
- **Static → dynamic DOM**: When replacing static markup with generated DOM, re-audit accessibility: labels, `aria-*`, and roving tabindex do not always carry over and may not fail unit tests.
- **HTML injection**: Prefer `DOMParser` + `append(...childNodes)` over assigning `innerHTML` for trusted-but-fetched fragments when avoiding CSP/lint issues.
- **Fetch**: Check `res.ok` before `res.text()` so errors surface to `.catch()` instead of parsing error bodies as content.

## PROCESS IMPROVEMENTS

- Preflight caught an async auto-init gap (`.catch()` on `initAutomationScriptsTabs`); worth checking call sites whenever sync APIs become async.

## TECHNICAL IMPROVEMENTS

- **Future**: Additional platforms are additive (registry entry + files). Linux/macOS scripts can drop in beside descriptions when ready.

## NEXT STEPS

None.
