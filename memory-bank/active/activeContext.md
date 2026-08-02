# Active Context

**Current Task:** Lean Firefox XPI + investigate store publish failures
**Phase:** BUILD - COMPLETE
**What Was Done:** Excluded `screenshots/`/`docs/` from web-ext; added package contract tests; investigated publish failures; moved AMO sign to `kewisch/action-web-ext@v2` (web-ext 10 + native `File`); documented CWS `invalid_grant` remediation.
**Next Step:** QA phase (automatic for L2)

## Files modified

- `/home/mobaxterm/git/tab-yeet/web-ext-config.cjs`
- `/home/mobaxterm/git/tab-yeet/test/tooling/web-ext-package.test.js` (new)
- `/home/mobaxterm/git/tab-yeet/.github/workflows/release-please.yaml` (`kewisch/action-web-ext@v2`)
- `/home/mobaxterm/git/tab-yeet/docs/cws-setup.md` (`invalid_grant` troubleshooting)

## Key decisions

- AMO root cause is Node 24 + web-ext 8 `FileBlob` filename loss — fixed by upstream v2 (web-ext 10 `File`), not by Node 20 opt-out or packaging lean-up alone
- Screenshots bloat was real (~87%) but unrelated to `unsupported_filetype` (0.8.2 shipped bloated and signed)
- CWS failure is OAuth credentials — operator must rotate secrets; no code path fix

## Deviations

- Dropped planned `ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION` + its contract test after operator moved to `kewisch/action-web-ext@v2`
