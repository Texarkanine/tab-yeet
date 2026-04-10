# Progress: CI Dual-Target Build Validation (M2)

Update `ci.yaml` to build and lint both Firefox MV2 and Chrome MV3 targets on PRs, uploading both as artifacts.

**Complexity:** Level 2

## Phase History

- **COMPLEXITY-ANALYSIS**: Complete. Level 2 determined — self-contained CI workflow change affecting a single file (`ci.yaml`).
- **PLAN**: Complete. 4-step plan: update npm aliases, update CI workflow, validate locally, check README. 7 validation behaviors, 2 files affected.
- **PREFLIGHT**: PASS. One advisory: updating `build:ext` to build both targets also affects `release-please.yaml` — benign since Chrome zip is produced but not consumed until M3. Firefox/AMO pipeline unaffected.
