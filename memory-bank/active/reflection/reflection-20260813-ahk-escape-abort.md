---
task_id: 20260813-ahk-escape-abort
date: 2026-08-13
complexity_level: 2
---

# Reflection: AHK Escape abort

## Summary

Shipped an Escape abort on the Windows clipboard-yeet AutoHotkey sample (`#HotIf sending` + `Esc::ExitApp`) so a runaway send loop can be killed without stealing Escape while idle. Delivered to plan after a replan that dropped Vitest greps of the `.ahk` file.

## Requirements vs Outcome

Both brief requirements landed: Escape aborts during a send, using AHK emergency-exit prior art. Usage is documented in the script header and `description.html`. Nothing added or dropped except the first plan's source-contract tests, which the operator ruled out as change-detectors.

## Plan Accuracy

The AHK design (`#HotIf sending`, keep `Sleep`, not `SetKeyDelay`) was right on the first pass and did not change. The test plan was wrong: this repo has never executed AHK, and same-file greps only fail when someone edits the file. Preflight caught the comment assertion; the operator caught the rest. The replan matched what we built. QA confirmed AHK v2 `global` scoping rather than finding a design miss.

## Build & QA Observations

Build was a small, docs-shaped edit; 104 tests and Firefox lint stayed green. QA passed with two non-blocking advisories (no `try`/`finally` on `sending`; ~17ms uninterruptible window on `SendText`) that the plan had already accepted.

## Insights

### Technical

- AutoHotkey v2: one `global sending := true` covers the whole hotkey function, so a later bare `sending := false` writes the global. A missing `global` would silently leave Escape armed. Worth checking first if this repo ships more AHK.

### Process

- A file this repo only displays is not an executable unit here. Vitest greps of that file are change-detectors, even when the file would execute on the user's machine. Inspection is the check; do not invent a parallel test harness for bundled samples.

### Million-Dollar Question

If the hatch had been in the original script, it would look like this: a send-gated `Esc::ExitApp` and a comment. What we built is that. Nothing notable to redesign.
