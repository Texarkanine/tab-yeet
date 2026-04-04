# Current Task: Firefox manifest compliance

**Complexity:** Level 1

## Build
- [x] Add contract test for Firefox manifest shape (`browser_specific_settings`, no `applications`, data consent).
- [x] Update `manifest.json` to satisfy Mozilla warnings (incl. min versions for data consent).
- [x] Run full test suite; `web-ext lint` clean (0 warnings).

## QA
- [x] Semantic review vs project brief; `.qa-validation-status` = PASS.
