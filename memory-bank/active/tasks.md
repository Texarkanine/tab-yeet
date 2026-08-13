# Task: AHK Escape abort

* Task ID: 20260813-ahk-escape-abort
* Complexity: Level 2
* Type: simple enhancement

Add an Escape-key emergency abort to the shipped AutoHotkey v2 clipboard-yeet sample so a runaway send loop can be stopped immediately. Follow AHK prior art: `Esc::ExitApp` ([ExitApp](https://www.autohotkey.com/docs/v2/lib/ExitApp.htm), [#HotIf](https://www.autohotkey.com/docs/v2/lib/_HotIf.htm)). Gate it with `#HotIf sending` so Escape is only bound while a send is in progress — a global `Esc::ExitApp` would kill the helper on every Escape in any app. Sleep is interruptible by hotkeys ([Sleep](https://www.autohotkey.com/docs/v2/lib/Sleep.htm)), so Escape during the 400ms inter-line delay exits at once rather than waiting out the delay.

**Replan (after preflight FAIL + operator):** The first plan scheduled Vitest source-contract greps of the `.ahk` file. Preflight correctly rejected the usage-comment assertion as a change-detector. The operator then rejected the rest: this repo has never tested AHK semantics (registry/options tests only cover the JS display path), a same-file grep for `Esc::` can only fail when someone edits that file, and the hatch is verified by reading the script. This plan writes no new tests.

This repo does not execute AutoHotkey. The `.ahk` is a bundled sample the options page shows as text (`automation-scripts/registry.js`). The WebExtension's executable behavior is unchanged.

## Test Plan (TDD)

### Behaviors to Verify

Verified by inspection of the shipped sample (not Vitest). Same-file greps are prohibited change-detectors ([always-tdd](../../.cursor/rules/shared/always-tdd.mdc)).

- Press Escape during a send → script exits via `Esc::ExitApp`; no further `SendText`/`Enter`
- Press Escape while idle → Escape is not bound (`#HotIf sending`); other apps keep Escape
- Empty clipboard → early return with tooltip; `sending` is not armed
- Reader of the options-page copy sees that Escape aborts (header comment + description.html)

### Test Infrastructure

- Framework: Vitest (`npm test`) for the WebExtension only
- Existing tests: `test/automation-scripts/registry.test.js` (registry paths), `test/options/options.test.js` (mocks AHK body as `"SCRIPT_BODY"`)
- New test files: none
- No AutoHotkey runner in CI; do not add one

### Test File Mapping

- None. Do not add `test/automation-scripts/clipboard-yeet-ahk.test.js` or any assertion on `.ahk` / description.html contents. Existing JS tests need no changes.

## Implementation Plan

1. [x] Add the Escape abort to the shipped AHK sample
   - Files: `automation-scripts/windows/clipboard-yeet.ahk`
   - Tests first: `N/A for prose & policy artifacts` (bundled sample this repo does not execute; inspection-verified; Vitest greps would be change-detectors)
   - Changes:
     - Top-level `sending := false`
     - `#HotIf sending` / `Esc::ExitApp` / `#HotIf`
     - In `^!+v`: after the empty-clipboard return, `global sending := true`; after the loop, `sending := false`
     - Header comment: Escape aborts and exits; re-run the script to restore the hotkey
     - Keep `DELAY_MS`, `SendText`/`Send("{Enter}")`, blank-line skip, and completion tooltip as they are
2. [x] Mention Escape in the Windows automation description fragment
   - Files: `automation-scripts/windows/description.html`
   - Tests first: `N/A for prose & policy artifacts`
   - Changes: one short sentence next to the existing AHK docs link: while sending, Escape aborts and exits the script
3. [x] Confirm existing JS tests still pass
   - Files: none new
   - Tests first: `N/A for prose & policy artifacts` (no new executable units; regression of the unchanged extension suite)
   - Changes: run `npm test`; fix only if this edit somehow broke JS tests (it should not)

## Technology Validation

No new technology - validation not required. AutoHotkey v2 is already the shipped script dialect; this adds documented language features (`ExitApp`, `#HotIf`, hotkeys interrupting `Sleep`).

## Dependencies

- Existing bundled file `automation-scripts/windows/clipboard-yeet.ahk` (options page displays it via `automation-scripts/registry.js`)
- AutoHotkey v2 on the user's Windows machine at runtime (unchanged; we do not execute AHK in this repo)

## Challenges & Mitigations

- AHK uninterruptible window: new threads are uninterruptible for 17ms / 1000 lines by default ([Thread Interrupt](https://www.autohotkey.com/docs/v2/lib/Thread.htm)). Mitigation: `SendText` of one URL is short; the long wait is `Sleep(DELAY_MS)`, which *is* interruptible. Do not switch to `SendEvent` + `SetKeyDelay` (that delay is uninterruptible — the trap in [AHK forum thread t=124774](https://www.autohotkey.com/boards/viewtopic.php?t=124774)).
- Global Escape stealing the key in every app: mitigation is `#HotIf sending`, not a bare `Esc::ExitApp`.
- `ExitApp` means the tray helper dies and must be re-launched: this is the documented emergency pattern; comments and description.html say so.
- Preflight may re-treat the `.ahk` as an executable unit that owes Vitest tests: it is not. This repo does not run it; the only Vitest tests that could be written are same-file change-detectors, which TDD forbids. Operator direction: inspect the script.

## Pre-Mortem

- Users still get stuck because Escape does nothing until the current `SendText` finishes, and we accidentally used an uninterruptible send delay: already covered by Challenge 1; keep `Sleep` as the inter-line wait.
- The "fix" is worse than the bug because Escape closes the helper whenever the user hits Esc in a chat: already covered by Challenge 2 (`#HotIf sending`).
- A second preflight fails by demanding the greps the first preflight/operator already classified as change-detectors: already covered by Challenge 4; this plan's TDD section is the instruction to that check.
- The AHK is invalid v2 and nobody notices until a user copies it: residual, accepted. Keep the edit small and docs-shaped; inspection is the verification. A Windows parse smoke check is out of scope.

## Status

- [x] Initialization complete
- [x] Test planning complete (TDD)
- [x] Implementation plan complete
- [x] Technology validation complete
- [x] Pre-Mortem complete
- [x] Preflight
- [x] Build
- [ ] QA
