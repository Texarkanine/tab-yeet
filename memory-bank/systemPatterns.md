# System Patterns

## How This System Works

Tab Yeet is a small **WebExtension** with two UI surfaces (popup + options) and **pure libraries** (`lib/transforms.js`, `lib/formats.js`). **`lib/storage.js`** is the only module that talks to `browser.storage.local` and owns the default rule list and storage key names, so popup and options never duplicate schema strings.

The options page includes a read-only **Automation scripts** section (platform tabs); it is informational only and does not use extension storage. Tabs and panel content are built dynamically from the `automation-scripts/registry.js` module; actual script files (`.ahk`) and description HTML fragments live in `automation-scripts/<platform>/` and are fetched from the extension bundle at runtime.

**Transforms** always run **in list order** for every URL, with disabled rules skipped and invalid regex patterns skipped (no throw). **Duplicate** tab checkboxes are driven by equality of **post-transform** URLs; the first index with a given URL stays checked.

Clipboard output is **transform → format → join with `\n`** with **no trailing newline**.

## Patterns

- **Pure transform/format modules**: Easier to test and keep consistent with product rules (see `lib/transforms.js`, `lib/formats.js`).
- **Centralized storage API**: `lib/storage.js` exports `STORAGE_KEYS`, `DEFAULT_RULES`, and load/save helpers (see tests in `test/lib/storage.test.js`).
