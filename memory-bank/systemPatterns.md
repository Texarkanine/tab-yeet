# System Patterns

## How This System Works

Tab Yeet is a small **WebExtension** with two UI surfaces (popup + options) and two **pure libraries** (`lib/transforms.js`, `lib/formats.js`). **`lib/storage.js`** is the only module that talks to `browser.storage.local` and owns the default rule list and storage key names, so popup and options never duplicate schema strings.

**Transforms** always run **in list order** for every URL, with disabled rules skipped and invalid regex patterns skipped (no throw). **Duplicate** tab checkboxes are driven by equality of **post-transform** URLs; the first index with a given URL stays checked.

Clipboard output is **transform → format → join with `\n`** with **no trailing newline**.

## Patterns

- **Pure transform/format modules**: Easier to test and keep consistent with product rules (see `lib/transforms.js`, `lib/formats.js`).
- **Centralized storage API**: `lib/storage.js` exports `STORAGE_KEYS`, `DEFAULT_RULES`, and load/save helpers (see tests in `test/lib/storage.test.js`).
