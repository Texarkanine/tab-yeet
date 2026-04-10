# Milestones: chromium-mv3-support

## Cross-milestone invariants

- Existing Firefox/AMO publishing pipeline must remain functional at every milestone boundary
- Shared source code (`lib/`, `popup/`, `options/`) must not be modified — Chrome build includes a `browser-shim.js` that aliases `chrome` → `browser` (Chrome does not implement the `browser.*` namespace); no browser-specific code paths in shared source
- GPLv3 licensing preserved in both packages
- Zero network permissions maintained in both packages
- `release-please` continues to manage versioning; `package.json` version is the single source of truth — both manifests derive their version from it
- Both builds must always produce the same version number

## Preflight Advisory Items

These findings from the L4 preflight apply to specific milestones:

1. **Manifest transform tests (M1)**: The manifest transform script must include unit tests per TDD rules.
2. **`web-ext lint` Chrome limitations (M1, M2)**: `web-ext lint` validates against Firefox-centric rules. It will accept MV3 manifests but won't catch Chrome-specific issues. Chrome-specific validation happens at CWS upload/review time. This is acceptable — do not try to work around it.
3. **CWS first publish is manual (M3)**: The CWS API requires the extension to be published manually once before automated uploads work. M3's documentation must include this bootstrapping step.
4. **`clipboardWrite` permission (M1)**: Valid in Chrome MV3 but not required for the Clipboard API in extension popups. M1 should decide whether to keep or drop it from the Chrome manifest — either is fine.

## Execution Order

- [x] Build system: dual-manifest packaging for Firefox MV2 and Chrome MV3 (create manifest transform script, add `build:firefox`/`build:chrome` npm scripts, verify both with `web-ext lint`, update README) — estimated L2
- [ ] CI: dual-target build validation on PRs (update `ci.yaml` to build+lint both targets, upload both as artifacts) — estimated L2
- [ ] Release pipeline: CWS publishing, dual-target release artifacts, and account setup documentation (extend `release-please.yaml` to build both targets on release, attach both to GH releases, add CWS publish job, update release-please config for dual-manifest version tracking, document CWS developer account + Google Cloud OAuth2 setup + repo secrets) — estimated L3
