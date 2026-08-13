# Progress

Add an Escape-key abort to the shipped AutoHotkey clipboard-yeet script so a runaway send loop can be stopped immediately.

**Complexity:** Level 2

## 2026-08-13 - COMPLEXITY-ANALYSIS - COMPLETE

* Work completed
    - Validated intent: Escape abort on `automation-scripts/windows/clipboard-yeet.ahk`
    - Classified as Level 2 (self-contained enhancement, single component)
* Decisions made
    - Not Level 1: the script is not broken; this is a missing safety hatch, not an error correction
    - Not Level 3: no multi-component feature or architectural change
* Insights
    - Options page displays the `.ahk` file as text; comment/doc updates in the script surface there automatically

## 2026-08-13 - PLAN - COMPLETE

* Work completed
    - Wrote Level 2 plan: source-contract tests, then `#HotIf sending` + `Esc::ExitApp` in the shipped `.ahk`, plus a description.html note
* Decisions made
    - Gate Escape with `#HotIf sending` so idle Escape is not stolen
    - Use `ExitApp` (AHK emergency prior art) rather than a stay-resident flag; document that the script must be re-run
    - Do not execute AHK in CI; lock the shipped source contract only
* Insights
    - `Sleep` is interruptible by hotkeys; `SetKeyDelay` is not — keep the existing `Sleep(DELAY_MS)` inter-line wait
