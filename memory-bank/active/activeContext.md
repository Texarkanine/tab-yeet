# Active Context

## Current Task

Drag-to-reorder for regex replacement rules on the options page (replacing Up/Down buttons).

## Phase

REFLECT — **complete** for task `drag-reorder-rules` (reflection doc updated 2026-04-13 to include UX rework: insertion bar, `reorderRulesToInsertionSlot`, ghost styling, disabled-row CSS fix).

## What Was Done

- **Complexity:** Level 2 — simple enhancement, self-contained to `options/` + `test/options/`.
- **Implementation:** Drag reorder in `options/options.js` / `options/options.css`; pure helpers (`reorderRules`, `reorderRulesToInsertionSlot`) and tests in `test/options/options.js`.
- **QA:** PASS — `memory-bank/active/.qa-validation-status`.
- **Reflection:** `memory-bank/active/reflection/reflection-drag-reorder-rules.md` (covers initial build + follow-up insertion-indicator pass).

## Next Step

Run `/niko-archive` to create the archive document and remove `memory-bank/active/` when satisfied (standalone task; no `milestones.md`).
