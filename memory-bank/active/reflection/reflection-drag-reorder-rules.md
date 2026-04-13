---
task_id: drag-reorder-rules
date: 2026-04-13
complexity_level: 2
---

# Reflection: Drag-to-reorder transform rules

## Summary

Replaced Up/Down buttons with HTML5 drag-and-drop using a per-row handle and a pure `reorderRules` helper, with Vitest coverage for reorder semantics.

## Requirements vs Outcome

Delivered drag-to-reorder on the options rule list with persistence unchanged (array order via existing storage). No keyboard reordering (explicitly out of scope).

## Plan Accuracy

The plan matched execution: index-based `reorderRules` plus delegated drop handling avoided duplicate listeners and input-field drop issues.

## Build & QA Observations

Tests and CI (`npm test`, `web-ext lint`, both builds) passed cleanly. No substantive QA fixes required.

## Insights

### Technical

Delegating `dragover`/`drop` to the `<ul>` and using `closest(".rule-card")` keeps reordering reliable when the pointer is over nested inputs.

### Process

Nothing notable.

### Million-Dollar Question

If reordering were assumed from day one, the same shape would still fit: a pure reorder helper plus a single list-level DnD binding—minimal extra structure.
