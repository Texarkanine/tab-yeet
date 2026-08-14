---
task_id: 20260813-ahk-escape-abort
complexity_level: 2
date: 2026-08-14
status: completed
---

# TASK ARCHIVE: AHK Escape abort

## SUMMARY

Added a send-gated Escape abort to the shipped Windows AutoHotkey clipboard-yeet sample so a runaway send loop can be stopped immediately. Escape calls `ExitApp` only while a send is in progress (`#HotIf sending`). Documented in the script header and `description.html`. Draft PR: [#49](https://github.com/Texarkanine/tab-yeet/pull/49).

## REQUIREMENTS

- Honor Escape as an abort during a send loop
- Follow AHK emergency-exit practice (`Esc::ExitApp`)
- Do not steal Escape while the helper is idle
- Document the abort for readers of the options-page copy

## IMPLEMENTATION

- **`automation-scripts/windows/clipboard-yeet.ahk`**: top-level `sending := false`; `#HotIf sending` / `Esc::ExitApp` / `#HotIf`; `global sending := true` after the empty-clipboard return; `sending := false` after the loop; usage step 4
- **`automation-scripts/windows/description.html`**: one sentence — while sending, Escape aborts and exits; re-run to restore the hotkey
- Kept `DELAY_MS`, `SendText`/`Enter`, blank-line skip, and the completion tooltip. Inter-line wait stays `Sleep` (interruptible), not `SetKeyDelay`

## TESTING

- No new tests. This repo does not execute AutoHotkey; same-file greps would be change-detectors. Existing registry/options tests cover the JS display path only and were unchanged
- Inspection of the shipped script; `npm test` 104/104; `npm run lint:firefox` clean
- `/niko-preflight` FAIL then PASS after replan; `/niko-qa` PASS

## LESSONS LEARNED

- A file this repo only displays is not an executable unit here. Do not invent Vitest greps for bundled AutoHotkey samples
- AutoHotkey v2: one `global sending := true` covers the whole hotkey function; a later bare `sending := false` writes the global. A missing `global` would silently leave Escape armed
- First-plan source-contract tests were change-detectors. Preflight caught the comment assertion; the operator caught the rest

## PROCESS IMPROVEMENTS

- When the only runnable check is reading a short bundled sample, plan `Tests first: N/A` up front instead of grepping the file in Vitest

## TECHNICAL IMPROVEMENTS

- A Windows AutoHotkey parse smoke check would close syntax risk. Out of scope for this task (new CI platform)

## NEXT STEPS

- Squash-merge [#49](https://github.com/Texarkanine/tab-yeet/pull/49) from the GitHub UI as Texarkanine. Delete any `Co-authored-by: Test User <test@example.com>` GitHub adds (branch commits used an unset git identity)
- CodeRabbit `try/finally` on `sending` was dismissed: if the loop throws, Escape still exits the script — the documented abort
