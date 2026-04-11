# Active Context

## Current Task
Release Pipeline: CWS Publishing, Dual-Target Release Artifacts & Account Setup Docs (M3)

## Phase
BUILD - COMPLETE

## What Was Done
- Renamed `build-release-xpi` job to `build-release` and updated all `needs:` references
- Expanded GH Release attachments to include both `*.xpi` and `*-chrome.zip`
- Added CWS artifact staging (mirrors existing AMO staging pattern)
- Added `cws-publish` job: OAuth token exchange → upload → publish, with error handling on every step
- CWS job is conditional on `secrets.CWS_CLIENT_ID` — skipped gracefully when CWS isn't configured
- Updated README Releases section to describe dual-target release + link to CWS setup guide
- Created `docs/cws-setup.md` covering developer account, Google Cloud project, OAuth2 credentials, first manual publish, and repo secrets
- Verified `release-please-config.json` needs no changes (Chrome manifest derived at build time)

## Files Modified
- `.github/workflows/release-please.yaml` — renamed build job, added CWS staging + publish job
- `README.md` — expanded Releases section
- `docs/cws-setup.md` — new file (CWS bootstrapping guide)

## Deviations from Plan
None — built to plan.

## Next Step
QA review will now run automatically.
