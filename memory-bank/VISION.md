# Tab Yeet — Product Brief

**Version:** 1.0
**Date:** 2026-04-03
**Status:** Ready for implementation

---

## Summary

Tab Yeet is a Firefox/LibreWolf browser extension that copies all tab URLs from the current window to the clipboard, with optional regex-based URL transforms and configurable output formatting. The core use case is sharing batches of URLs to messaging platforms (Telegram, Signal, etc.) without manual per-tab copy-paste.

## Platform

- **Target:** Firefox / LibreWolf
- **Manifest:** V2
- **Chromium / Manifest V3:** Out of scope for v1. If pursued later, tab group awareness (`chrome.tabGroups` API) would be a natural addition at that time.

## User Interaction

### Popup (primary UI)

Activated by clicking the extension icon in the toolbar.

1. **Tab list** — All tabs in the current window are displayed as a checkbox list. Each row shows the page title and URL (or a truncated form). All tabs are checked by default, including pinned tabs.
2. **Duplicate detection** — If multiple tabs share the same URL, duplicates are displayed but unchecked by default. "Same URL" is evaluated *after* transforms are applied.
3. **Format selector** — A dropdown menu above or below the tab list. Persists the user's last selection to `browser.storage.local`. See [Output Formats](#output-formats).
4. **Copy button** — Applies transforms to checked tabs, formats output per the selected format, writes the result to the clipboard.
5. **Success confirmation** — Brief, non-modal visual feedback (checkmark, green flash, or similar). No `alert()` dialogs.

### Options Page

Accessible via the standard `about:addons` → Tab Yeet → Preferences path, or via a gear icon in the popup.

Provides CRUD management for the transform rule list:

- Add, edit, and delete transform pairs
- Reorder rules (transforms are applied in list order; first match wins per rule, but all rules run sequentially)
- Each rule is a `{pattern, replacement}` pair where `pattern` is a regular expression and `replacement` is a string supporting backreferences (`$1`, `$2`, etc.)
- Validate regex on input; surface parse errors inline

## Output Formats

The format system is designed for extensibility. Internally, formats are implemented as a map of `formatKey → formatterFunction(title, url)`, so adding a new format requires only one new entry.

### v1 Formats

| Key        | Label          | Output per tab                        |
|------------|----------------|---------------------------------------|
| `plain`    | Plain URLs     | `https://example.com`                 |
| `markdown` | Markdown List  | `- [Page Title](https://example.com)` |

Tabs are joined by `\n`. No trailing newline.

### Adding Formats in Future

New formats (e.g., HTML links, backtick-wrapped, numbered list, CSV) should require only:

1. A new entry in the format map
2. A new option in the dropdown

No structural changes to the popup, storage, or copy logic.

## Transform Engine

### Behavior

Transforms modify URLs before formatting and before duplicate detection. Each rule is applied to every URL in sequence. All rules run against every URL (they are not short-circuiting); a URL may be modified by multiple rules.

### Rule Schema

```json
{
  "id": "string (uuid or auto-increment)",
  "pattern": "string (valid RegExp source)",
  "replacement": "string (supports $1, $2, etc.)",
  "enabled": true
}
```

Rules support an `enabled` flag so users can toggle rules without deleting them.

### Default Rules (ship with extension)

| Pattern                                      | Replacement             | Purpose                  |
|----------------------------------------------|-------------------------|--------------------------|
| `^https?://(www\.)?(x\.com\|twitter\.com)/`  | `https://fixupx.com/`   | Twitter/X embed fix      |
| `^https?://(www\.)?instagram\.com/`          | `https://ddinstagram.com/` | Instagram embed fix   |
| `^https?://(www\.)?reddit\.com/`             | `https://vxreddit.com/`  | Reddit embed fix        |
| `^https?://(www\.)?tiktok\.com/`             | `https://vxtiktok.com/`  | TikTok embed fix        |

These defaults are editable and deletable by the user. If deleted, they are not restored on update.

## Permissions

| Permission | Reason |
|---|---|
| `tabs` | Query tab URLs and titles in the current window |
| `clipboardWrite` | Write formatted output to clipboard |
| `storage` | Persist transform rules, format preference |

No host permissions. No remote code. No network requests.

## Non-Goals (v1)

- Chromium/Brave support
- Tab group awareness
- Sending directly to Telegram or any other service (API integration)
- Keyboard shortcuts (could be added later via `commands` API)
- Drag-and-drop reordering in the popup tab list
- Export/import of transform rules

## File Structure (suggested)

```
tab-yeet/
├── manifest.json
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── options/
│   ├── options.html
│   ├── options.js
│   └── options.css
├── lib/
│   ├── transforms.js    # transform engine
│   └── formats.js       # format strategy map
└── icons/
    ├── icon-48.png
    └── icon-96.png
```

## Open Design Notes for Implementer

- **Tab ordering** in the popup should match the browser's left-to-right tab order (`tabs.query` returns this by default via the `index` property).
- **Long titles/URLs** in the popup should truncate with ellipsis, not wrap. Full URL visible on hover (via `title` attribute) is sufficient.
- **Regex flags:** Patterns should be compiled with no flags by default. If flag support is needed later, extend the rule schema with an optional `flags` field. Do not over-engineer this for v1.
- **Error handling:** If clipboard write fails (e.g., permissions issue in hardened LibreWolf config), surface an error state in the popup — do not fail silently.
