---
task_id: drag-reorder-rules
complexity_level: 2
date: 2026-04-13
status: completed
---

# TASK ARCHIVE: Drag-to-reorder transform rules

## SUMMARY

Replaced per-row **Up / Down** controls on the options page with **HTML5 drag-and-drop** using a `⋮⋮` handle and delegated events on a list wrapper. A follow-up pass added a **thick insertion-bar** preview, **insertion-slot** reorder semantics (`reorderRulesToInsertionSlot`), and strong **ghost** styling (fade + dotted border) on the dragged row—including a CSS fix so **disabled** rows do not override drag visuals.

## REQUIREMENTS

- Replace button-based reorder with drag-and-drop; no new runtime dependencies (vanilla ES modules).
- Persisted order remains the rule **array order** via existing `loadRules` / `saveRules` (transform order unchanged except as the user reorders).
- Clear visual feedback for **where** a drop lands and **which** row is being dragged (rework).
- Out of scope: keyboard-only reorder; popup UI.

## IMPLEMENTATION

- **Files:** `options/options.js`, `options/options.css`, `options/options.html` (`.rule-list-wrap` for absolute insertion indicator), `test/options/options.test.js`.
- **Pure helpers:** `reorderRules`, `reorderRulesToInsertionSlot(rules, fromIndex, insertionSlot)` (slot `0…n`); `moveRule` retained for tests/programmatic use.
- **DnD:** `dragstart` on handle sets `activeDragRuleId`; `dragover`/`drop` on `.rule-list-wrap` with `insertionSlotFromPointer(clientY)` (half-row and gap handling); `positionInsertIndicator` places the bar; single bind guarded by `wrap.dataset.tabYeetDragDropBound`.
- **UX:** ~10px horizontal bar using `AccentColor`; source row ~18% opacity + 2px dotted border; `.rule-card.disabled:not(.rule-card--dragging)` for disabled opacity when not dragging.
- **PR:** opened toward `main` (e.g. GitHub PR for branch `drag-reorder`).

## TESTING

- Vitest: `reorderRules`, `reorderRulesToInsertionSlot`, and existing rule helpers in `test/options/options.test.js`.
- `web-ext lint` (Firefox), `web-ext build` for Firefox and Chrome staging paths as in project CI.
- Manual: options page—drag by handle, verify insertion bar and final order.

## LESSONS LEARNED

- **Insertion slots (0…n)** match both the visible bar and the saved order better than mapping every drop to “move to this row’s index” alone.
- **Delegating `dragover`/`drop` to a wrapper** around the `<ul>` avoids per-render listener churn and keeps `preventDefault` consistent with a shared indicator element.
- **Skipping a twitchy `dragleave`** avoided flicker when moving across nested controls; **`dragend`** / **`drop`** clear state.
- **Test nuance:** slot “before row *c*” vs “after last row” differs; one test expectation was corrected after slot semantics were spelled out.
- **CSS:** disabled-row opacity must not trump `.rule-card--dragging`.

## PROCESS IMPROVEMENTS

Nothing blocking—normal **iterate after UX feedback** once a first slice shipped. For similar UI, consider specifying insertion-slot behavior and a visible affordance in the first plan if predictability matters.

## TECHNICAL IMPROVEMENTS

- Optional future: keyboard reorder (not requested).
- If another list gains DnD, reusing **pure slot-based reorder** + **one container** for drag state remains a good split.

## NEXT STEPS

None.
