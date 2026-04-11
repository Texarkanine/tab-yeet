---
task_id: m3-release-pipeline
date: 2026-04-11
complexity_level: 3
---

# Reflection: Release Pipeline — CWS Publishing, Dual-Target Release Artifacts & Account Setup Docs

## Summary

Extended the release-please workflow with dual-target (Firefox + Chrome) GitHub Release attachments, a conditional Chrome Web Store publish job, and a complete CWS bootstrapping guide. All 6 implementation steps executed to plan with one minor QA fix.

## Requirements vs Outcome

Every requirement from the plan was delivered:
- Build job renamed and both artifacts attached to GH Release
- CWS artifact staged and published via direct REST calls
- CWS job conditional on secrets (Firefox/AMO pipeline unaffected when CWS not configured)
- README updated with dual-target release description
- `docs/cws-setup.md` created covering all bootstrapping steps
- release-please config confirmed no-op

No requirements were dropped, descoped, or added.

## Plan Accuracy

The plan was precise — file list, step sequence, and scope were all correct. No steps needed reordering, splitting, or adding. The identified challenges (job rename breaking `needs:`, CWS secrets conditionality, first-publish bootstrapping) were all addressed straightforwardly. No surprises emerged.

## Creative Phase Review

No creative phase was executed — all open questions were resolved during planning (CWS publish mechanism, documentation location, release-please config, job conditionality).

## Build & QA Observations

Build was smooth and linear. The plan's specificity (exact API endpoints, exact curl flags, exact artifact staging patterns) meant implementation was largely transcription with minor adaptation.

QA caught one issue: the auth step used `curl -sf` (fail-silently on HTTP errors) while the upload and publish steps used `curl -s -w "\n%{http_code}"` (explicit HTTP code capture). The `-f` flag suppresses the response body on errors, defeating the error diagnostics code. Fixed to use the consistent pattern across all three steps.

## Cross-Phase Analysis

Preflight advisory #1 ("add proper error handling to CWS curl commands") was incorporated into the plan before build began. This meant error handling was designed in, not retrofitted — though QA still caught an inconsistency in how the auth step implemented it vs. the other two steps. This validates both the preflight (caught the design gap early) and QA (caught the implementation inconsistency).

## Insights

### Technical
- `curl -sf` is a subtle footgun in CI workflows: the `-f` flag suppresses the HTTP response body on 4xx/5xx errors, which defeats error diagnostics. When capturing error responses for logging matters (it always does in CI), use `curl -s` with explicit HTTP code capture via `-w "\n%{http_code}"`.

### Process
- Nothing notable. The workflow phases performed as intended for this task.
