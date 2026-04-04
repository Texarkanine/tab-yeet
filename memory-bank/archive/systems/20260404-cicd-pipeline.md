---
task_id: cicd-pipeline
complexity_level: 4
date: 2026-04-04
status: completed
---

# TASK ARCHIVE: CI/CD Pipeline for Tab Yeet

## SUMMARY

Built a complete CI/CD and release infrastructure for the Tab Yeet browser extension across three milestones: PR-gated CI with Dependabot (M1), release-please CD pipeline with unsigned XPI publishing (M2), and AMO submission automation with GPLv3 licensing, source archive, and signed XPI attachment (M3). The extension now goes from merge-to-main through versioning, changelog generation, GitHub Release, and AMO submission without manual intervention (after initial one-time AMO listing).

## REQUIREMENTS

- PR-gated GitHub Actions workflow running Vitest tests, `web-ext lint`, and `web-ext build`
- Dependabot for npm and GitHub Actions ecosystems
- release-please (manifest mode) bumping `package.json` and `manifest.json` versions from Conventional Commits
- Changelog generation and GitHub Releases with unsigned `.xpi` attached
- `package-lock.json` update workflow for release-please PRs
- GitHub App token pattern (matching jekyll-mermaid-prebuild reference)
- AMO submission via `kewisch/action-web-ext` sign (listed channel) on release
- Source code archive per Mozilla submission policy
- GPLv3 license declaration on AMO versions
- Release notes forwarded from GitHub Release body
- Signed `.xpi` conditionally attached to GitHub Release when AMO returns it

## IMPLEMENTATION

### Key Files

- `.github/workflows/ci.yaml` — PR-gated CI (Vitest, web-ext lint, web-ext build)
- `.github/workflows/release-please.yaml` — release-please + XPI build/upload + AMO sign + conditional signed XPI upload
- `.github/workflows/update-package-lock.yaml` — lock file updater for release PRs
- `.github/dependabot.yaml` — npm + GitHub Actions ecosystem config
- `release-please-config.json` / `.release-please-manifest.json` — manifest-mode release-please config
- `test/tooling/release-workflow-amo.test.js` — contract tests for AMO workflow shape
- `README.md` — operator documentation for secrets and release flow

### Approach

Each milestone extended the workflow file incrementally. The release-please workflow was the integration spine — M2 established it, M3 added AMO steps after the existing XPI build. `actions/checkout` was upgraded to `fetch-depth: 0` for `git archive` support. Source archive is generated via `git archive` at the tagged revision. Release notes are fetched from the GitHub Release via `gh api` (since the workflow triggers on push, not release event). The AMO sign step uses `kewisch/action-web-ext@v1` with `GPL-3.0-only` as the license slug plus `licenseFile: LICENSE` (required because the action's `KNOWN_LICENSES` allowlist omits `-only` suffixes). Signed XPI upload is conditional on the sign step producing an artifact.

## TESTING

- **Contract tests**: `test/tooling/release-workflow-amo.test.js` asserts YAML contains required AMO strings (`kewisch/action-web-ext`, `cmd: sign`, `channel: listed`, `AMO_SIGN_KEY`, `AMO_SIGN_SECRET`, source archive, license, release notes pattern)
- **CI verification**: `npm run ci` (format + lint + build + test) green after each milestone
- **QA reviews**: `/niko-qa` passed for all three milestones, validating plan-to-implementation alignment
- **Extension packaging**: `test/tooling/extension-package.test.js` confirmed XPI contents unchanged by workflow additions

## MILESTONE LIST

Original milestones (unchanged throughout execution):

1. **M1 — CI workflow and Dependabot**: Add CI workflow (Vitest + web-ext lint + web-ext build) and Dependabot configuration for npm and GitHub Actions ecosystems
2. **M2 — Release-please CD pipeline**: Add release-please configuration, release workflow with unsigned .xpi attachment, and package-lock.json update workflow for release PRs
3. **M3 — AMO submission automation**: Add AMO submission automation to the release workflow using kewisch/action-web-ext sign (listed channel) with source code archive and GPLv3 license, attaching signed .xpi to the GitHub release when available

No milestones were added, removed, re-scoped, or reordered during execution.

## SUB-RUN SUMMARIES

### M1 — CI workflow and Dependabot (L2, cicd-m1-ci-dependabot)

Shipped PR-gated GitHub Actions (Vitest, `web-ext lint`, `web-ext build`), Dependabot for npm and GitHub Actions, and `test/tooling/ci-config.test.js` to lock in the contract. Key decision: `web-ext build` requires `--overwrite-dest` for repeat runs. Reference repo patterns from jekyll-mermaid-prebuild translated directly. A thin Vitest file asserting repo layout and workflow contents provides fast CI contract feedback without actionlint.

### M2 — Release-please CD pipeline (L2, cicd-m2-release-please)

Release-please (manifest mode, Node + `manifest.json` extra file), GitHub App–backed workflows, post-release XPI build/upload, and a release-PR `package-lock.json` updater. Operator removed `test/tooling/ci-config.test.js` by policy — validation is by code review and GitHub Actions on `main`. One fix caught after initial commit: release workflows pinned Node 20 while CI used `.nvmrc` (24); fixed by switching all jobs to `actions/setup-node@v6` with `node-version-file: ".nvmrc"`.

### M3 — AMO submission automation (L2, cicd-m3-amo)

Release workflow now signs the built `.xpi` with AMO (listed) via `kewisch/action-web-ext@v1`, uploads `sources.zip` from `git archive`, forwards GitHub Release notes from the REST API, declares GPLv3 for the version, and conditionally attaches a signed `.xpi` when the action returns one. Contract tests guard the YAML shape in `test/tooling/release-workflow-amo.test.js`. Main surprise: `kewisch/action-web-ext` treats `GPL-3.0-only` as a custom license (its `KNOWN_LICENSES` set is a short allowlist), so `licenseFile: LICENSE` was required alongside the SPDX name.

## SYSTEM STATE

The Tab Yeet repository now has a fully automated pipeline:

1. **PR CI** (`.github/workflows/ci.yaml`): Every PR runs Vitest, web-ext lint, and web-ext build against `.nvmrc` Node version.
2. **Dependency updates** (`.github/dependabot.yaml`): Automated PRs for npm and GitHub Actions dependency bumps.
3. **Release flow** (`.github/workflows/release-please.yaml`): Conventional Commits on `main` trigger release-please to open/update a release PR. On merge, release-please creates a GitHub Release with changelog. The same workflow then builds an unsigned `.xpi`, attaches it to the release, creates a `sources.zip` via `git archive`, fetches release notes from the GitHub Release, submits to AMO for signing (listed channel, GPLv3), and conditionally uploads the signed `.xpi` if AMO returns one synchronously.
4. **Lock file sync** (`.github/workflows/update-package-lock.yaml`): Keeps `package-lock.json` current on release-please PRs.

Operator prerequisites remain for first activation:
- GitHub App configured (`HELPER_APP_ID` / `HELPER_APP_PRIVATE_KEY`)
- Mozilla developer account with AMO API credentials (`AMO_SIGN_KEY` / `AMO_SIGN_SECRET`)
- Initial manual AMO listing (first submission must be manual; API handles subsequent versions)

## CROSS-RUN INSIGHTS

- **Node version alignment across workflows**: M2 caught a mismatch between hardcoded Node 20 in release workflows and Node 24 in `.nvmrc`/CI. Using `node-version-file: ".nvmrc"` everywhere eliminates this class of drift. This is worth encoding as a project convention.
- **Third-party action behavior vs upstream docs**: M3 discovered that `kewisch/action-web-ext` has its own license allowlist that diverges from Mozilla's API documentation. When integrating Actions that wrap external APIs, validate against the action's source code, not only the upstream API docs.
- **Contract tests as lightweight CI policy**: M1 introduced contract tests for workflow YAML; M2's operator removed them by policy preference; M3 reintroduced scoped contract tests for AMO specifically. The pattern of reading workflow YAML with `fs` and asserting substrings in Vitest is low-cost and catches drift without requiring actionlint infrastructure.
- **Incremental workflow extension**: Each milestone extended `release-please.yaml` without breaking prior functionality. The workflow's job/step structure accommodated this well — M3 added steps after M2's XPI build without modifying M2's steps.
- **Million-Dollar Question pattern across milestones**: All three reflections noted that if the full pipeline were a day-one requirement, a shared composite action or reusable workflow for "Node install + cache + npm ci" would reduce duplication. For a single-extension repo with one release workflow, inline steps remain proportionate. This is a valid optimization target if the pattern is reused across repos.

## LESSONS LEARNED

- `web-ext build --overwrite-dest` is necessary for idempotent CI scripts that chain multiple npm run commands
- `setup-node` with `node-version-file` across all workflows prevents version drift between CI and release builds
- `kewisch/action-web-ext` `KNOWN_LICENSES` is a subset of SPDX — always pair the slug with `licenseFile` for GPL variants
- Listed AMO signing is asynchronous; conditional upload logic must be non-fatal
- Thin contract tests (read YAML, assert substrings) give fast local feedback on workflow shape without external tooling

## PROCESS IMPROVEMENTS

- The L2 workflow should continue autonomously from QA into Reflect (via `level2-reflect.mdc`), not stop and ask the operator to invoke `/niko-reflect` manually. This was noted in M3's reflection and caused an unnecessary round-trip.
- Repository policy on contract tests should be decided early and documented — M2 removed them, M3 re-added scoped ones. Recording the policy in the system patterns file would prevent churn.

## TECHNICAL IMPROVEMENTS

- Consider pinning `kewisch/action-web-ext` to a commit SHA (not just `@v1`) for supply-chain hardening, consistent with Dependabot managing GitHub Actions version bumps.
- If more extensions or repos adopt this pattern, extract a reusable composite action for the "checkout + Node + npm ci + web-ext build" sequence.

## NEXT STEPS

- Configure GitHub repo secrets: `HELPER_APP_ID`, `HELPER_APP_PRIVATE_KEY`, `AMO_SIGN_KEY`, `AMO_SIGN_SECRET`
- Perform initial manual AMO submission to create the listing
- Merge to `main` with a Conventional Commit to trigger the first automated release cycle
- Verify end-to-end: release-please PR → merge → GitHub Release → XPI + AMO submission
