# Product Context

## Target Audience

Power users of Firefox and LibreWolf who frequently share batches of URLs — particularly to messaging platforms (Telegram, Signal, etc.) where per-tab copy-paste is tedious.

## Use Cases

- Copy all open tab URLs from the current browser window to the clipboard in one action
- Apply regex-based URL transforms before copying (e.g., rewrite twitter.com to fixupx.com for embeddable links)
- Choose output format (plain URLs, Markdown list) to match the destination platform
- Manage a reusable library of transform rules via an options page

## Key Benefits

- Eliminates repetitive per-tab copy-paste workflows
- Automatic URL rewriting for social-media embed-fix services (Twitter/X, Instagram, Reddit, TikTok)
- Extensible format and transform systems for future growth
- Zero network permissions — all processing is local

## Success Criteria

- Popup accurately lists all tabs in the current window, matching browser tab order
- Duplicate detection (post-transform) correctly defaults duplicates to unchecked
- Transform engine applies all rules sequentially to every URL
- Clipboard write succeeds and provides clear visual feedback; failures surface an error state
- Format preference persists across sessions via `browser.storage.local`

## Key Constraints

- Firefox / LibreWolf only; Manifest V2
- No host permissions, no remote code, no network requests
- Chromium / Manifest V3 support explicitly out of scope for v1
- Licensed under GPLv3
