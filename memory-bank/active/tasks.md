# Current Task: Dual-Manifest Build System (M1)

**Complexity:** Level 2

Build system: dual-manifest packaging for Firefox MV2 and Chrome MV3 (create manifest transform script, add `build:firefox`/`build:chrome` npm scripts, verify both with `web-ext lint`, update README).

## Preflight Advisory Items (from L4)

1. **Manifest transform tests**: Must include unit tests for the manifest transform script per TDD rules.
2. **`web-ext lint` Chrome limitations**: Lints against Firefox-centric rules; accepts MV3 manifests but won't catch Chrome-specific issues. Acceptable.
3. **`clipboardWrite` permission decision**: Valid in Chrome MV3 but not required for Clipboard API in extension popups. Decide whether to keep or drop it.
