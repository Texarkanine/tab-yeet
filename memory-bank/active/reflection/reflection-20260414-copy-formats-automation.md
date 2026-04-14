---
task_id: 20260414-copy-formats-automation
date: 2026-04-14
complexity_level: 2
---

# Reflection: Copy formats and automation scripts UI (with rework)

## Summary

Built five clipboard format variants and an Automation scripts options section. PR feedback prompted a rework: inline JS string constants for the AHK script were extracted to real bundled files with a registry module driving dynamic tab/panel construction. Both the initial build and the rework succeeded without plan deficiencies.

## Requirements vs Outcome

All requirements delivered across both iterations. The rework was additive (better architecture for the same feature set), not corrective. No requirements dropped or descoped. The rework added the extensibility property: adding a new platform now requires only files + a registry entry — no HTML or JS changes.

## Plan Accuracy

The initial L2 plan was accurate for the original scope. The rework plan was also accurate — the preflight caught one minor gap (missing `.catch()` on the async auto-init call) that was trivially amended. No steps needed reordering. The identified challenges (`web-ext lint` with HTML injection, Chrome staging `.html` scanning) were correctly assessed and didn't materialize as problems.

## Build & QA Observations

Build was straightforward in both iterations. The `DOMParser` approach for injecting fetched HTML fragments worked cleanly and avoided CSP/lint concerns. QA caught one accessibility regression in the rework: the dynamically created textarea lost its visually-hidden `<label>` from the old static HTML, fixed by adding `aria-label`. This is a recurring pattern to watch when converting static HTML to dynamic DOM construction.

## Insights

### Technical

When replacing static HTML with dynamically constructed DOM, audit every element for accessibility attributes that were provided by the static markup (labels, ARIA relationships, `tabindex`). These are easy to lose in the conversion and won't surface in functional tests.

### Process

Nothing notable.

### Million-Dollar Question

If the extension had assumed from day one that automation scripts would be platform-specific bundled files, the architecture would look exactly like what we built: a registry module pointing to file paths, fetched at runtime. The only difference might be that `options.html` would never have had the hardcoded tabs at all. The rework arrived at the natural architecture cleanly.
