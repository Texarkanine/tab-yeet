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
