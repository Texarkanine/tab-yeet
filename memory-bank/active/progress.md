# Progress

Exclude non-runtime `screenshots/` and `docs/` from Firefox/AMO XPIs, lock that with contract tests, and investigate the 0.9.0 AMO/CWS publish failures.

**Complexity:** Level 2

## 2026-08-02 - COMPLEXITY-ANALYSIS - COMPLETE

* Work completed
    - Clarified intent: lean XPI packaging + investigate store publish failures
    - Classified as Level 2 (self-contained enhancement + investigation)
* Decisions made
    - Level 2: packaging ignore/tests are contained; publish work is investigate-first with in-repo fixes only where justified
* Insights
    - Prior chat already showed screenshots = ~87% of XPI; Chrome stays lean via stage allowlist

## 2026-08-02 - PLAN - COMPLETE

* Work completed
    - Wrote Level 2 plan: web-ext ignore screenshots/docs, built-XPI contract tests, AMO/CWS investigation with remediation boundaries
* Decisions made
    - Built-XPI zip listing assertion required (not config-string-only)
    - Do not conflate lean packaging with AMO unsupported_filetype unless evidence ties them
* Insights
    - Chrome stays lean via stage allowlist; Firefox packs from repo root minus ignoreFiles

## 2026-08-02 - PREFLIGHT - COMPLETE

* Work completed
    - Validated plan against TDD encoding, conventions, completeness
    - Amended AMO investigation: evaluate source-dir vs prebuilt `.xpi`; require contract test before any workflow YAML change
* Decisions made
    - Preflight PASS — proceed to build
* Insights
    - Config-only ignore tests would miss web-ext glob quirks; built-XPI listing assertion remains load-bearing
