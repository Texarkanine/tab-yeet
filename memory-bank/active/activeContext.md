# Active Context

## Current Task: AHK Escape abort
**Phase:** PLAN - COMPLETE

## What Was Done
- Classified Level 2: self-contained safety hatch on the shipped Windows AHK script.
- Planned TDD source contracts in `test/automation-scripts/clipboard-yeet-ahk.test.js` (AHK cannot run in Vitest/CI).
- Implementation: `#HotIf sending` + `Esc::ExitApp` in `automation-scripts/windows/clipboard-yeet.ahk`, plus a usage comment and a one-line description.html note. Keep existing send loop, delay, and empty-clipboard behavior.

## Next Step
- Preflight validation (spawn `/niko-preflight`)
