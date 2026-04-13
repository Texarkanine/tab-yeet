---
task_id: chromium-mv3-support
complexity_level: 4
date: 2026-04-13
status: completed
---

# TASK ARCHIVE: Chromium (MV3) Support for Tab Yeet

## SUMMARY

Delivered a single-codebase, dual-packaging pipeline: Firefox MV2 (`.xpi`) for AMO and Chrome MV3 (`.zip`) for the Chrome Web Store, with CI validation on PRs, release-please attaching both artifacts to GitHub Releases, an optional CWS publish job, and `docs/cws-setup.md` for account and OAuth setup. Runtime compatibility uses a Chrome-only `browser-shim.js` so shared source keeps using the `browser.*` namespace. Production validation: CWS publish succeeded.

## REQUIREMENTS

From `projectbrief.md`:

1. One codebase, two packaging pathways (MV2 `.xpi`, MV3 `.zip`) without a second repo or forked branding.
2. MV3 compatibility via manifest transform and Chromium runtime shim (not browser-specific branches in shared `lib/`, `popup/`, `options/`).
3. Dual-target release pipeline: AMO (existing) + Chrome Web Store on release.
4. Documentation for CWS accounts, Google Cloud OAuth2, and repo secrets.

Constraints preserved: Firefox/AMO pipeline unchanged, GPLv3, zero network permissions, minimal tooling, `package.json` / release-please as version source of truth.

## IMPLEMENTATION

- **M1 — Dual-manifest build**: Manifest transform (`transformManifest`), `build:firefox` / `build:chrome`, `browser-shim.js` for Chrome, README updates. Chrome package is MV3; Firefox remains MV2 source with automated transform.
- **M2 — CI**: `.github/workflows/ci.yaml` (or equivalent) builds both targets on PRs; separate artifacts. Chrome `web-ext lint` excluded from CI where it conflicts with Firefox-centric rules (established in M1).
- **M3 — Release pipeline**: `release-please.yaml` job rename (`build-release`), both `*.xpi` and `*-chrome.zip` attached to GitHub Releases, `cws-submit` artifact, conditional `cws-publish` using [`chrome-webstore-upload`](https://github.com/fregante/chrome-webstore-upload-cli) CLI, README Releases section, `docs/cws-setup.md` (loopback OAuth, not deprecated OOB). `CWS_EXTENSION_ID` as repo variable; step-level gating for secrets (job-level `secrets.*` in `if:` is invalid in GitHub Actions).

Key files touched across milestones: manifest transform and build scripts, `browser-shim.js`, CI workflow, `release-please.yaml`, `README.md`, `docs/cws-setup.md`.

## TESTING

- M1: Vitest coverage for transform; `web-ext` build/lint for Firefox; both targets built locally.
- M2: CI as integration gate for dual build + artifacts.
- M3: Lint/tests unchanged for JS; workflow behavior validated in CI and on real release; operator confirmed successful CWS publish.

## LESSONS LEARNED

- **`web-ext lint` is Firefox-centric**: It can reject valid Chrome MV3 manifests; do not rely on it for Chrome validation—CWS upload/review is the practical check.
- **Chrome does not implement `browser.*`**: A shim aliasing `chrome` → `browser` is required; shared source stays unified.
- **`secrets.*` in job-level `if:`**: In GitHub Actions, secrets are not available in job-level condition expressions (evaluate empty); use step-level gates with env-backed checks and outputs.
- **Prefer maintained CLIs** for OAuth + upload flows over long bespoke `curl` when a well-supported tool exists.
- **OAuth docs**: Google deprecated the OOB flow; use loopback redirect and current endpoints.

## PROCESS IMPROVEMENTS

- Cross-check prior milestone’s `ci` script and progress before planning CI changes (M2 plan briefly assumed Chrome lint in CI).
- When preflight flags platform behavior (e.g. `secrets.*` in conditions), verify against docs or a minimal workflow test instead of risk-guessing.
- Validate runtime behavior in the target browser during build when introducing a new target (called out in M1 reflection).

## TECHNICAL IMPROVEMENTS

None mandatory post-archive. Optional future: abstract manifest source if more than two targets appear (M1 reflection noted current transform is sufficient for two targets).

## NEXT STEPS

None for this initiative. Future work is normal product maintenance.

---

## Milestone List

Original L4 milestones (`memory-bank/active/milestones.md`):

1. **Build system**: dual-manifest packaging for Firefox MV2 and Chrome MV3 — **completed** (L2-scoped sub-run).
2. **CI**: dual-target build validation on PRs — **completed** (L2-scoped sub-run).
3. **Release pipeline**: CWS publishing, dual-target release artifacts, account setup docs — **completed** (L3-scoped sub-run).

No milestones were added, removed, or reordered during execution. Scope evolved only inside M3 (curl → CLI, step-level secret gating, doc fixes from review)—not a milestone-structure change.

---

## Sub-Run Summaries (inlined from reflections)

### M1 — Dual-manifest build (`reflection-dual-manifest-build.md`)

Built manifest transform and dual-target builds; 61 tests passing (10 new). Plan executed in order. Deviation: `web-ext lint` rejects valid Chrome MV3 with Firefox-specific rules (`ADDON_ID_REQUIRED`), so Chrome lint was excluded from CI; `lint:chrome` remains for local use. **Critical correction**: Chrome does not natively support `browser.*`; `browser-shim.js` is required. **Million-dollar question**: Keeping MV2 as source of truth with a simple transform is appropriate at this scale; no redesign to a single abstract manifest was warranted.

### M2 — CI dual-target (`reflection-m2-ci-dual-target.md`)

CI builds both targets and uploads separate artifacts. Plan error: proposed re-adding `lint:chrome` to CI despite M1 excluding it—caught at build time, fixed immediately. **Million-dollar question**: Separate per-target build/upload steps are the right shape; no redesign.

### M3 — Release pipeline (`reflection-m3-release-pipeline.md`)

Delivered dual GH Release attachments, conditional CWS job via `chrome-webstore-upload`, README + `docs/cws-setup.md`. Post-build fixes: job-level `secrets.*` condition was a hard bug (job always skipped)—fixed with step-level gate; replaced bespoke curl with CLI; docs updated from deprecated OOB OAuth to loopback flow. Preflight understated the `secrets.*` issue; CodeRabbit caught it. **Technical**: Use step-level gates for secret presence; prefer maintained CLI for CWS. **Process**: Verify platform claims in preflight instead of assuming “low risk.”

---

## System State

After all milestones:

- **Build**: npm scripts produce Firefox `.xpi` and Chrome `.zip` with aligned versions from `package.json` / release-please.
- **CI**: PR pipeline validates both targets; artifacts available for inspection.
- **Release**: GitHub Release includes both packages; AMO signing path preserved; CWS publish runs when configured (repo variables/secrets), confirmed working in production.
- **Docs**: README describes dual release; `docs/cws-setup.md` documents CWS developer account, Google Cloud, OAuth (loopback), first manual publish requirement, and secrets/variables.

End-to-end: one repo, one version line, Firefox and Chromium distribution paths both operational.

---

## Cross-Run Insights

- **Linting philosophy**: Firefox tooling drove early assumptions; Chrome validation is fundamentally “build + CWS/real browser,” not `web-ext lint` parity.
- **GitHub Actions secrets**: Expressions and availability rules are easy to get wrong; job `if:` vs step env is a recurring footgun—worth documenting in workflow comments for future jobs.
- **Review value**: External review (CodeRabbit) caught a blocker internal QA missed (`secrets.*` at job level), reinforcing verify-don’t-assume for platform behavior.
- **Shim pattern**: Injecting compatibility at the Chrome package edge kept shared code clean across three milestones—a design decision that paid off in every phase.
