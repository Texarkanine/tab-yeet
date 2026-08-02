---
task_id: 20260801-codecov-coverage-badge
date: 2026-08-01
complexity_level: 2
---

# Reflection: Codecov coverage upload and README badge

## Summary

Wired Vitest V8 coverage into CI with Codecov upload (PR + push to main), README badge, and ignores so coverage artifacts never enter git or the Firefox XPI. Delivered as planned plus one build-time fix for web-ext packaging.

## Requirements vs Outcome

All brief requirements met: coverage generation, Codecov upload with existing `CODECOV_TOKEN`, README badge, no duplicate of prior CI work. Added push-to-main (preflight) and web-ext `coverage` ignore (build discovery) — both necessary for a working badge and safe local `npm run ci`.

## Plan Accuracy

Plan sequence was right. Surprises: (1) CI was PR-only so default-branch badge would stay empty without a main trigger; (2) `web-ext` source-dir `.` packs and lints `coverage/` unless ignored — not in the original step list.

## Build & QA Observations

Contract tests drove the config/CI surface cleanly. QA only needed a techContext sync for the new coverage/Codecov facts.

## Insights

### Technical
- If CI runs `test:coverage` before `web-ext lint/build` with `--source-dir .`, `coverage/` must be in `web-ext-config.cjs` `ignoreFiles` or the XPI ships report HTML and lint floods with noise.

### Process
- Codecov README badges need a default-branch upload path; PR-only CI is not enough.

### Million-Dollar Question

Same shape we shipped: coverage as a first-class npm script + Vitest config from day one, `coverage/` in web-ext ignores alongside `test/`/`build/`, and CI always on PR and main. Nothing more elegant was needed.
