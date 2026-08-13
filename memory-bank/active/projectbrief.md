# Project Brief

## User Story

As a user of the shipped AutoHotkey clipboard-yeet script, I want an Escape-key abort so that if I accidentally start a long send loop I can stop it immediately instead of being stuck until it finishes.

## Use-Case(s)

### Accidental activation

The user focuses a window, hits Ctrl+Alt+Shift+V with a large clipboard (or the wrong window), and the script starts sending line after line. Pressing Escape stops the send loop right away.

### Deliberate abort mid-run

The user starts a send, realizes the target or clipboard is wrong, and presses Escape to halt remaining lines.

## Requirements

1. The shipped AutoHotkey v2 script (`automation-scripts/windows/clipboard-yeet.ahk`) must honor Escape as an abort during a send loop.
2. Follow established AutoHotkey emergency-exit practice; Escape is the kill key.

## Constraints

1. Scope is the shipped Windows AHK automation. Linux and macOS have no scripts yet.
2. Do not add features beyond the abort hatch.

## Acceptance Criteria

1. While the send loop is running, pressing Escape stops further SendText/Enter actions.
2. The abort is documented in the script's usage comments so a reader of the options-page copy can see it.
