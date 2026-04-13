# Project Brief: Drag-to-reorder transform rules

## User story

As someone configuring Tab Yeet’s transform rules on the options page, I want to reorder rules by dragging instead of using separate Up/Down buttons, so adjusting rule order is faster and clearer.

## Requirements

- Replace per-row **Up** / **Down** controls with **drag-and-drop reordering** of the rule list.
- Persisted order remains the **array order** used today (`loadRules` / `saveRules`); behavior of transforms (order of application) must not change except as the user reorders.
- No new runtime dependencies; stay within vanilla ES modules.

## Out of scope

- Keyboard-only reordering (not requested).
- Popup UI (rules are edited on the options page only).
