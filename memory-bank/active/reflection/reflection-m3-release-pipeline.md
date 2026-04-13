---
task_id: m3-release-pipeline
date: 2026-04-11
complexity_level: 3
---

# Reflection: Release Pipeline — CWS Publishing, Dual-Target Release Artifacts & Account Setup Docs

## Summary

Extended the release-please workflow with dual-target (Firefox + Chrome) GitHub Release attachments, a conditional Chrome Web Store publish job (using `chrome-webstore-upload` CLI), and a complete CWS bootstrapping guide. Built to plan, then refined through PR review feedback.

## Requirements vs Outcome

Every requirement from the plan was delivered:
- Build job renamed and both artifacts attached to GH Release
- CWS artifact staged and published via [`chrome-webstore-upload`](https://github.com/fregante/chrome-webstore-upload-cli) CLI (replaced the initial bespoke curl implementation during PR review)
- CWS job conditional on secrets via step-level gating (the initial job-level `secrets.*` approach was a bug — see Insights)
- `CWS_EXTENSION_ID` uses a repository variable (`vars.*`) rather than a secret, since it's a public identifier
- README updated with dual-target release description
- `docs/cws-setup.md` created covering all bootstrapping steps, using the loopback OAuth flow (not the deprecated OOB flow)
- release-please config confirmed no-op

No requirements were dropped or descoped. The CWS publish mechanism and OAuth docs were both revised post-build based on PR review feedback.

## Plan Accuracy

The plan was precise — file list, step sequence, and scope were all correct. No steps needed reordering, splitting, or adding. The identified challenges (job rename breaking `needs:`, CWS secrets conditionality, first-publish bootstrapping) were all addressed straightforwardly. No surprises emerged.

## Creative Phase Review

No creative phase was executed — all open questions were resolved during planning (CWS publish mechanism, documentation location, release-please config, job conditionality).

## Build & QA Observations

Build was smooth and linear. The initial implementation used bespoke `curl` calls for the CWS API (auth, upload, publish). QA caught an inconsistency in curl error handling flags.

PR review (CodeRabbit + operator) prompted three post-build revisions:
1. **`secrets.*` in job-level `if:` is always empty** — GitHub Actions doesn't expose secrets in job-level conditions. The preflight had flagged this as "low risk, may log warnings" but it was actually a hard bug (job always skipped). Fixed by moving the check to a step-level gate.
2. **Bespoke curl replaced with `chrome-webstore-upload` CLI** — operator identified that ~60 lines of hand-rolled OAuth + upload + publish could be replaced with a single `npx` call to a well-maintained tool (491 stars). Good tradeoff.
3. **Deprecated OOB OAuth flow** — the docs initially used `urn:ietf:wg:oauth:2.0:oob`, which Google blocked in January 2023. Replaced with loopback redirect (`http://localhost`) and the v2 auth endpoint.

## Cross-Phase Analysis

Preflight advisory #1 ("add proper error handling to CWS curl commands") was incorporated into the plan before build began — but became moot when the curl approach was replaced by the CLI tool during PR review. Preflight advisory #2 ("`secrets.*` in job `if:` may log warnings") turned out to be understated — it was a real bug, not just cosmetic warnings. This was caught by CodeRabbit, not by the internal QA phase. Lesson: the preflight should have investigated the `secrets.*` behavior more rigorously instead of accepting it as "low risk."

## Insights

### Technical
- **`secrets.*` is not available in job-level `if:` conditions** in GitHub Actions. The expression silently evaluates to empty string, causing the job to always be skipped. Use a step-level gate pattern instead: a dedicated step checks the secret via env var and sets a skip output, then subsequent steps condition on that output.
- When a CI workflow step is just "call a REST API with credentials," check if a maintained CLI or action already exists before writing bespoke curl. The CWS API is 3 simple calls, but auth + error handling + response validation added up to ~60 lines that a one-line `npx` call handles better.

### Process
- Preflight's risk assessment for the `secrets.*` condition was wrong — "low risk, may log warnings" was actually "hard bug, job always skipped." When preflight identifies a concern about platform behavior, it should verify the behavior rather than estimating risk from assumptions. A 30-second test (or documentation lookup) would have caught this before build.
