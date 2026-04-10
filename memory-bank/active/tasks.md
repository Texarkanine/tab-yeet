# Current Task: Chromium (MV3) Support for Tab Yeet

**Complexity:** Level 4

Milestone execution managed by `memory-bank/active/milestones.md`.

## Preflight Findings (Advisory)

1. **Manifest transform tests**: Milestone 1's sub-run must include unit tests for the manifest transform script per TDD rules.
2. **`web-ext lint` Chrome limitations**: Lints against Firefox-centric rules; accepts MV3 manifests but won't catch Chrome-specific issues. Chrome validation happens at CWS upload/review. Acceptable.
3. **CWS first publish is manual**: The CWS API requires the extension to be published manually once before automated uploads work. Milestone 3 docs must include this bootstrapping step.
4. **`clipboardWrite` permission decision**: Valid in Chrome MV3 but not required for Clipboard API in extension popups. Milestone 1 sub-run decides whether to keep or drop it.
