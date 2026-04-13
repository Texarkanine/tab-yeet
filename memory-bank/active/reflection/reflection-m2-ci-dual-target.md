---
task_id: m2-ci-dual-target
date: 2026-04-10
complexity_level: 2
---

# Reflection: CI Dual-Target Build Validation on PRs

## Summary

Updated the CI workflow and npm scripts to build both Firefox and Chrome targets on PRs, uploading separate artifacts for each. Clean execution with one plan correction during build.

## Requirements vs Outcome

All milestone requirements met: CI builds both targets and uploads both as separate artifacts. Chrome lint is excluded from CI — `web-ext lint` rejects Chrome MV3 manifests with Firefox-specific errors, a limitation established in M1. The `build:ext` alias now produces both artifacts, which also means `release-please.yaml` generates both (benign — it only consumes the `.xpi`).

## Plan Accuracy

The plan had one error: it proposed adding `lint:chrome` to CI, the `lint:ext` alias, and the `ci` npm script. M1 had already established that `web-ext lint` fails on Chrome manifests and intentionally excluded Chrome lint from the `ci` script. This was caught immediately during build validation when `lint:chrome` returned exit code 1. Quick correction — no time lost.

The file list, step sequence, and scope were otherwise correct. The Chrome lint limitation was identified in the plan's "Challenges" section but the mitigation was wrong ("no mitigation needed" when it should have been "don't run it").

## Build & QA Observations

Build was straightforward — a 2-file, ~20-line diff. The Chrome lint correction was the only surprise. QA found zero issues. Total implementation time was dominated by the Niko workflow phases rather than the actual coding work.

## Insights

### Technical
- Nothing notable — straightforward config change.

### Process
- For L4 sub-runs, the plan phase should cross-check the previous milestone's `ci` npm script and progress notes before proposing CI changes. The `ci` script was already the source of truth for "what should CI run" — the plan should have started there instead of independently deciding to add Chrome lint.

### Million-Dollar Question

If dual-target CI had been a foundational assumption, the workflow would have started with separate per-target lint/build/upload steps — which is exactly what we built. No redesign opportunity. The implementation is as clean as the problem allows.
