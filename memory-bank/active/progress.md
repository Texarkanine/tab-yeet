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

## 2026-08-02 - BUILD - COMPLETE

* Work completed
    - Added `test/tooling/web-ext-package.test.js`; excluded `screenshots/` + `docs/` in `web-ext-config.cjs` (XPI ~53KB, no store assets)
    - Root-caused AMO `unsupported_filetype`: web-ext 8 `FileBlob` → FormData filename `"blob"` under Node 24
    - Switched AMO sign to `kewisch/action-web-ext@v2` (web-ext 10 native `File`; `approvalTimeout: 0` still supported)
    - Documented CWS `invalid_grant` refresh-token remediation in `docs/cws-setup.md`
    - Full suite 104/104; lint clean; dual build OK
* Decisions made
    - Prefer upstream v2 over Node 20 opt-out workaround
    - Lean packaging kept as separate hygiene win, not claimed as AMO fix
* Insights
    - Historical release runs often “failed” overall while AMO succeeded — CWS `invalid_grant` has been failing since at least 0.8.2

## 2026-08-02 - QA - COMPLETE

* Work completed
    - Semantic review against plan: packaging, AMO root-cause + v2 bump, CWS docs
* Decisions made
    - QA PASS — no KISS/YAGNI/completeness blockers; Node 20 opt-out correctly abandoned
* Insights
    - README already pointed at kewisch/action-web-ext generically — no doc drift from leaving the fork

## 2026-08-02 - REFLECT - COMPLETE

* Work completed
    - Wrote `memory-bank/active/reflection/reflection-20260802-lean-xpi-publish-investigate.md`
    - Reconciled persistent files — no updates required
* Decisions made
    - Reflect complete; archive is operator-gated
* Insights
    - Prefer web-ext 10+ / native `File` for AMO uploads on Node 24 runners
