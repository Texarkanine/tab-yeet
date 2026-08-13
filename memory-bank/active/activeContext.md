# Active Context

## Current Task: AHK Escape abort
**Phase:** BUILD - COMPLETE

## What Was Done
- Added `#HotIf sending` + `Esc::ExitApp` to `automation-scripts/windows/clipboard-yeet.ahk`; `sending` armed only after the empty-clipboard return; header documents Escape abort/exit.
- Added one sentence to `automation-scripts/windows/description.html`.
- Inspection: hatch is send-gated, empty clipboard does not arm `sending`, `Sleep(DELAY_MS)` unchanged.
- `npm test`: 104 passed (11 files). `npm run lint:firefox`: 0 errors/warnings. No new tests.

## Next Step
- QA review (spawn `/niko-qa`)
