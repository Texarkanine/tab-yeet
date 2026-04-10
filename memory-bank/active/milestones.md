# Milestones: chromium-mv3-support

## Cross-milestone invariants

- Existing Firefox/AMO publishing pipeline must remain functional at every milestone boundary
- Shared source code (`lib/`, `popup/`, `options/`) must not be modified — `browser.*` APIs work natively in both Firefox MV2 and Chrome MV3 (M136+); no polyfills, no browser-specific code paths
- GPLv3 licensing preserved in both packages
- Zero network permissions maintained in both packages
- `release-please` continues to manage versioning; `package.json` version is the single source of truth — both manifests derive their version from it
- Both builds must always produce the same version number

## Execution Order

- [ ] Build system: dual-manifest packaging for Firefox MV2 and Chrome MV3 (create manifest transform script, add `build:firefox`/`build:chrome` npm scripts, verify both with `web-ext lint`, update README) — estimated L2
- [ ] CI: dual-target build validation on PRs (update `ci.yaml` to build+lint both targets, upload both as artifacts) — estimated L2
- [ ] Release pipeline: CWS publishing, dual-target release artifacts, and account setup documentation (extend `release-please.yaml` to build both targets on release, attach both to GH releases, add CWS publish job, update release-please config for dual-manifest version tracking, document CWS developer account + Google Cloud OAuth2 setup + repo secrets) — estimated L3
