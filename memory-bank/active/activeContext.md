# Active Context

## Current Task
CI: Dual-Target Build Validation on PRs (M2)

## Phase
BUILD - COMPLETE

## What Was Done
- Updated `package.json`: `build:ext` now runs both `build:firefox` and `build:chrome`; `lint:ext` and `ci` unchanged (Chrome lint excluded due to `web-ext lint` Firefox-centric false positives, as established in M1)
- Updated `.github/workflows/ci.yaml`: explicit Firefox lint, Firefox build, Chrome build steps; separate artifact uploads (`tab-yeet-firefox` and `tab-yeet-chrome`)
- Validated locally: 67 tests pass, Firefox lint clean, both builds produce artifacts
- README already up to date — no changes needed

## Deviations from Plan
- Removed Chrome lint from CI and npm aliases: plan originally included `lint:chrome` in CI and `lint:ext`, but `web-ext lint` fails on Chrome MV3 manifests (ADDON_ID_REQUIRED). This was already established during M1 and excluded from the `ci` script. Corrected during build.

## Next Step
- QA review runs automatically
