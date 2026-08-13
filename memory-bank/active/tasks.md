# Task: AHK Escape abort

* Task ID: 20260813-ahk-escape-abort
* Complexity: Level 2
* Type: simple enhancement

Add an Escape-key emergency abort to the shipped AutoHotkey v2 clipboard-yeet script so a runaway send loop can be stopped immediately. Follow AHK prior art: `Esc::ExitApp` ([ExitApp](https://www.autohotkey.com/docs/v2/lib/ExitApp.htm), [#HotIf](https://www.autohotkey.com/docs/v2/lib/_HotIf.htm)). Gate it with `#HotIf sending` so Escape is only bound while a send is in progress — a global `Esc::ExitApp` would kill the helper on every Escape in any app. Sleep is interruptible by hotkeys ([Sleep](https://www.autohotkey.com/docs/v2/lib/Sleep.htm)), so Escape during the 400ms inter-line delay exits at once rather than waiting out the delay.

## Test Plan (TDD)

### Behaviors to Verify

- Escape abort is present: shipped `.ahk` source defines an `Esc::` (or `Escape::`) hotkey whose body exits the script (`ExitApp`) → users can panic-stop a send
- Abort is send-gated: the Escape hotkey sits under `#HotIf sending` (reset with `#HotIf`) → Escape is not stolen while the helper is idle
- Send loop arms the gate: the `^!+v` handler assigns `sending := true` before iterating lines and `sending := false` after the loop (not before the empty-clipboard early return)
- Usage comment: header comments tell the reader that Escape aborts (and that the script exits, so they re-run it)
- Empty clipboard unchanged: empty clipboard still early-returns with a tooltip and does not arm `sending`

### Test Infrastructure

- Framework: Vitest (`npm test`), as in `package.json` / `vitest.config.js`
- Test location: `test/automation-scripts/`
- Conventions: ESM, `describe`/`it`/`expect` from `vitest`; file-read contract tests use `node:fs` `readFileSync` + `fileURLToPath(import.meta.url)` to reach repo root (see `test/tooling/web-ext-package.test.js`)
- New test files: `test/automation-scripts/clipboard-yeet-ahk.test.js`
- Note: AHK cannot run in this Linux/Vitest CI. Tests lock the shipped source contract, not AHK runtime. Residual risk: a syntactically invalid `.ahk` would still pass; mitigation is a small, copy-paste-faithful change against AHK v2 docs, plus the existing options-page tests that only mock the file path.

### Test File Mapping

- `test/automation-scripts/clipboard-yeet-ahk.test.js` (new): read `automation-scripts/windows/clipboard-yeet.ahk` and assert the behaviors above as source contracts (hotkey + `ExitApp`, `#HotIf sending` wrapping, `sending` true/false around the loop, Escape mentioned in the header, empty-clipboard return before `sending := true`)
- Existing `test/automation-scripts/registry.test.js` and `test/options/options.test.js`: no change (they mock AHK body or only check `scriptPath`)

## Implementation Plan

1. Write failing source-contract tests for the Escape abort
   - Files: `test/automation-scripts/clipboard-yeet-ahk.test.js`
   - Tests first: new file; cases for Escape/`ExitApp`, `#HotIf sending`, sending armed only around the send loop, usage comment, empty-clipboard early return
   - Changes: add the test file; run it and watch it fail against the current script
2. Implement the abort in the shipped AHK script
   - Files: `automation-scripts/windows/clipboard-yeet.ahk`
   - Tests first: already written in step 1; re-run until they pass
   - Changes:
     - Top-level `sending := false`
     - `#HotIf sending` / `Esc::ExitApp` / `#HotIf`
     - In `^!+v`: after the empty-clipboard return, `global sending := true`; after the loop, `sending := false`
     - Header comment: Escape aborts and exits; re-run the script to restore the hotkey
     - Keep `DELAY_MS`, `SendText`/`Send("{Enter}")`, blank-line skip, and completion tooltip as they are
3. Mention Escape in the Windows automation description fragment
   - Files: `automation-scripts/windows/description.html`
   - Tests first: `N/A for prose & policy artifacts`
   - Changes: one short sentence next to the existing AHK docs link: while sending, Escape aborts and exits the script
4. Full-suite verification
   - Files: none new
   - Tests first: `npm test` (entire suite, per test-running practices)
   - Changes: none unless a test fails

## Technology Validation

No new technology - validation not required. AutoHotkey v2 is already the shipped script dialect; this adds documented language features (`ExitApp`, `#HotIf`, hotkeys interrupting `Sleep`).

## Dependencies

- Existing shipped file `automation-scripts/windows/clipboard-yeet.ahk` (options page displays it via `automation-scripts/registry.js`)
- AutoHotkey v2 on the user's Windows machine at runtime (unchanged; we do not execute AHK in CI)

## Challenges & Mitigations

- AHK uninterruptible window: new threads are uninterruptible for 17ms / 1000 lines by default ([Thread Interrupt](https://www.autohotkey.com/docs/v2/lib/Thread.htm)). Mitigation: `SendText` of one URL is short; the long wait is `Sleep(DELAY_MS)`, which *is* interruptible. Do not switch to `SendEvent` + `SetKeyDelay` (that delay is uninterruptible — the trap in [AHK forum thread t=124774](https://www.autohotkey.com/boards/viewtopic.php?t=124774)).
- Global Escape stealing the key in every app: mitigation is `#HotIf sending`, not a bare `Esc::ExitApp`.
- `ExitApp` means the tray helper dies and must be re-launched: this is the documented emergency pattern; comments and description.html say so. A stay-resident flag+break would wait out the remainder of `Sleep` and is easier to get wrong (v2 `global` on the flag). Prefer ExitApp.
- Tests cannot execute AHK: source contracts only; keep assertions on the safety contract, not a full-file snapshot (avoid change-detectors).

## Pre-Mortem

- Users still get stuck because Escape does nothing until the current `SendText` finishes, and we accidentally used an uninterruptible send delay: already covered by Challenge 1; implementation must keep `Sleep` as the inter-line wait.
- The "fix" is worse than the bug because Escape closes the helper whenever the user hits Esc in a chat: already covered by Challenge 2 (`#HotIf sending`).
- CI is green but the script is invalid v2 and never runs for users: already covered by the Test Infrastructure residual-risk note; keep the AHK edit small and docs-shaped.
- A test snapshots the whole `.ahk` and becomes a change-detector: already covered by Challenge 4; tests assert fragments of the contract only.

## Preflight Report

**Result:** FAIL

### Findings

- **Blocking — TDD plan encoding:** The planned test for the usage-comment wording is a prose change-detector. It can only fail when someone deliberately edits the comment, not when executable abort behavior breaks. Remove that assertion from Behaviors to Verify, Test File Mapping, and implementation step 1. Keep the usage-comment and `description.html` edits as review-verified prose deliverables with `Tests first: N/A for prose & policy artifacts`.
- **Pass — executable TDD ordering:** The remaining source-contract tests precede the AHK implementation and cover the executable safety contract: gated Escape hotkey, `ExitApp`, gate activation after the empty-clipboard return, gate reset after the loop, and unchanged empty-clipboard behavior.
- **Pass — conventions:** The proposed script and description paths match the platform registry and extension layout. The proposed Vitest file follows the existing `test/automation-scripts/` ESM conventions and root-file reading pattern.
- **Pass — dependency impact:** The options page already fetches the registered AHK and description files, both Firefox packaging and Chrome staging include `automation-scripts/`, and no registry or options-page implementation changes are required. Existing tests mock script content or assert registry paths and need no changes.
- **Pass — conflict detection:** No existing Escape abort, `ExitApp`, `#HotIf`, or sending-state implementation overlaps with the proposal. Official AutoHotkey v2 documentation confirms `#HotIf`, `Esc::ExitApp`, and that hotkeys can launch while `Sleep` is waiting.
- **Pass — requirement coverage:** The implementation steps map both project requirements and acceptance criteria to concrete files and preserve the current send loop, delay, blank-line handling, tooltip, and empty-clipboard return.

### Advisory

- A future Windows CI smoke check that launches AutoHotkey v2 solely to parse the shipped script would close the documented syntax-validation gap. That adds platform setup and changes task scope/complexity, so it is not part of this Level 2 task.

### Required Replan

- Run `/niko-plan`, remove only the usage-comment content assertion, preserve the prose edits, and retain all executable source-contract tests before re-running `/niko-preflight`.

## Status

- [x] Initialization complete
- [x] Test planning complete (TDD)
- [x] Implementation plan complete
- [x] Technology validation complete
- [x] Pre-Mortem complete
- [x] Preflight complete (FAIL — replan required)
- [ ] Build
- [ ] QA
