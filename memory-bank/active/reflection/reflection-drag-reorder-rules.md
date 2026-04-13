---
task_id: drag-reorder-rules
date: 2026-04-13
complexity_level: 2
---

# Reflection: Drag-to-reorder transform rules

## Summary

Replaced Up/Down controls with HTML5 drag-and-drop (handle + delegated events), then iterated once on UX: a visible **insertion bar** driven by **insertion-slot** semantics (`reorderRulesToInsertionSlot`), a much stronger **ghost** style on the source row, and a CSS fix so **disabled** rows do not override drag styling.

## Requirements vs Outcome

**Original brief:** drag reorder without new dependencies; order still persisted via existing storage — met.

**Follow-up rework:** clearer **where** a drop lands (thick horizontal indicator) and **which** row is being dragged (heavy fade + dotted border) — met. Keyboard-only reorder remained out of scope.

## Plan Accuracy

The first plan (pure `reorderRules`, delegated `dragover`/`drop`, handle-only drag) matched the initial build. The **rework** was not in the original plan: it introduced `reorderRulesToInsertionSlot`, a wrapper for the indicator, half-row hit testing, and tests corrected for **slot vs swap** semantics (a test initially expected the wrong outcome for “before row *c*” vs “after last”).

## Build & QA Observations

Vitest and `web-ext lint` stayed green across both iterations. The substantive bug was **conceptual** (test expectation for insertion slots), not implementation. **CSS specificity:** `.rule-card.disabled` had to exclude `.rule-card--dragging` so the ghost style was visible on disabled rules.

## Insights

### Technical

- **Insertion slots (0…n)** align the visible bar with the saved order better than “drop on row → swap to that index,” especially for multi-step moves.
- **List-level `dragover` on a wrapping container** keeps the indicator and `preventDefault` consistent without attaching per-row listeners every render.
- Omitting a noisy **`dragleave`** handler avoided flicker when crossing child elements; **`dragend`**/`drop` still clear state.

### Process

Nothing notable beyond normal plan-then-rework when UX feedback arrives after a first shippable slice.

### Million-Dollar Question

If ordered lists with DnD were a first-class assumption, you would still want **pure reorder helpers** and **one container** owning drag state; the only upfront addition would be **slot-based APIs and a visible insertion affordance** in the first PR rather than after feedback.
