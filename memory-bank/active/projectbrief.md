# Project Brief: Tab Yeet v1

Implement the Tab Yeet browser extension as specified in `memory-bank/VISION.md` — a Firefox/LibreWolf Manifest V2 extension that copies tab URLs from the current window to the clipboard, with regex-based URL transforms and configurable output formatting.

## Deliverables

- `manifest.json` — Manifest V2 with `tabs`, `clipboardWrite`, `storage` permissions
- **Popup** (`popup/`) — Tab list with checkboxes, duplicate detection (post-transform), format selector, copy button with visual feedback
- **Options page** (`options/`) — CRUD management for transform rules (add, edit, delete, reorder, enable/disable toggle, inline regex validation)
- **Transform engine** (`lib/transforms.js`) — Sequential regex rule application against every URL
- **Format system** (`lib/formats.js`) — Strategy map of `formatKey → formatterFunction(title, url)`; v1 ships `plain` and `markdown`
- **Default transform rules** — Twitter/X → fixupx.com, Instagram → instagramez.com (InstagramEZ per [Lexedia embed fixer list](https://gist.github.com/Lexedia/bbbde4dbbf628b0bfe8476a96a977a8f)), Reddit → vxreddit.com, TikTok → vxtiktok.com
- **Icons** (`icons/`) — Extension icons at 48px and 96px

## Authoritative Spec

`memory-bank/VISION.md` (v1.0, 2026-04-03)
