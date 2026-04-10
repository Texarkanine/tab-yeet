---
task_id: dual-manifest-build
date: 2026-04-10
complexity_level: 2
---

# Reflection: Dual-Manifest Build System (M1)

## Summary

Built a manifest transform script and dual-target build system that produces both Firefox MV2 (`.xpi`) and Chrome MV3 (`.zip`) packages from a single codebase. All 8 implementation steps completed, 61 tests passing (10 new), both builds verified.

## Requirements vs Outcome

All 4 milestone deliverables met: manifest transform script, `build:firefox`/`build:chrome` npm scripts, `web-ext lint` verification, and README update. One requirement reinterpreted: "verify both with `web-ext lint`" — Chrome lint excluded from CI because `web-ext lint` rejects valid Chrome MV3 manifests with Firefox-specific errors. `lint:chrome` remains available as a standalone script.

## Plan Accuracy

The 8-step plan executed in order with no reordering or additions. File list and scope were accurate. The identified challenge about `web-ext lint` Chrome limitations materialized more severely than anticipated: the L4 preflight said it "will accept MV3 manifests" but it actually rejects them with `ADDON_ID_REQUIRED` (a Firefox-specific MV3 requirement). This required excluding `lint:chrome` from the CI script, a deviation from the original plan.

## Build & QA Observations

Build was smooth — TDD cycles worked efficiently for the pure `transformManifest` function. The staging directory approach is clean. QA caught one trivial documentation issue (package.json description still said "Firefox extension").

## Insights

### Technical
- `web-ext lint` is more tightly coupled to Firefox than documentation suggests. It doesn't just miss Chrome issues — it actively rejects valid Chrome MV3 manifests with Firefox-specific validation rules. M2/M3 should not plan for Chrome linting via `web-ext lint`.

### Process
- Nothing notable.

### Million-Dollar Question
If Chrome MV3 had been a foundational assumption, the project might store a single abstract manifest definition and generate both MV2 and MV3 from it. But with only two targets and a simple derivation (remove Firefox fields, rename one key), keeping MV2 as source of truth with an automated transform is already near-optimal for this scale. No redesign warranted.
