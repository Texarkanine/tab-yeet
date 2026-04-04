# Task: M2 — Release-please CD pipeline (Tab Yeet)

- **Task ID:** `cicd-m2-release-please`
- **Complexity:** Level 2
- **Type:** Simple enhancement (DevOps / release automation)

Ship release-please on `main` (Node release type), keep `package.json` and `manifest.json` versions in sync via release-please, generate changelog from Conventional Commits, and on release creation build an unsigned `.xpi` with `web-ext build` and attach it to the GitHub Release. Add a PR workflow that updates `package-lock.json` on Release Please branches (mirror `update-gemfile-lock.yaml` from jekyll-mermaid-prebuild). Use the same GitHub App token pattern (`actions/create-github-app-token` with `vars.HELPER_APP_ID` and `secrets.HELPER_APP_PRIVATE_KEY`).

## Validation (no workflow-inventory tests)

Operator removed `test/tooling/ci-config.test.js`; extension behavior remains covered by `test/lib/**`, `test/popup/**`, etc. **M2** is verified by review of the YAML/config files, first green `npm test` / `npm run ci`, and successful runs on GitHub after secrets are configured.

## Implementation plan

1. **release-please configuration**  
   - **Files:** `release-please-config.json`, `.release-please-manifest.json`.  
   - **Changes:** Add Node `release-type` for package `"."`; configure `extra-files` (or documented equivalent) so `manifest.json` receives the same version bump as `package.json`. Seed `.release-please-manifest.json` with the current `0.1.0` to match `package.json` / `manifest.json`.

2. **Release Please + XPI workflow**  
   - **Files:** `.github/workflows/release-please.yaml`.  
   - **Changes:**  
     - `on.push.branches: [main]`; permissions `contents: write`, `pull-requests: write`, `issues: write` (omit `id-token: write` unless a chosen action requires OIDC — reference uses it for RubyGems, not needed here).  
     - Job `release-please` with `actions/create-github-app-token@v3` + `googleapis/release-please-action@v4`; export `release_created`, `tag_name` for the build job.  
     - Job `build-release-xpi`: `if: needs.release-please.outputs.release_created == 'true'`; checkout at tag; `actions/setup-node@v6` with `node-version-file: ".nvmrc"`; `npm ci`; `npm run build:ext`; attach `web-ext-artifacts/*.xpi` via `softprops/action-gh-release@v2`.

3. **Lockfile update workflow**  
   - **Files:** `.github/workflows/update-package-lock.yaml`.  
   - **Changes:** PR trigger with `paths` for `package.json` and `manifest.json`; `if: startsWith(github.head_ref, 'release-please--')`; app token checkout; `npm install` (or documented npm command) to refresh `package-lock.json`; `nick-fields/retry@v4` commit/push loop analogous to reference (adapt git user/email pattern).

4. **Documentation**  
   - **Files:** `README.md`.  
   - **Changes:** Document that releases are driven by release-please, Conventional Commits are required on `main`, and repo `HELPER_APP_*` secrets/vars are required for workflows that mutate branches/releases. Link to Milestone 2 operator notes in `milestones.md` where helpful.

5. **Green tests + CI**  
   - **Changes:** `npm test` and `npm run ci` with remaining extension test suite only.

## Technology validation

- **No new runtime or npm dependencies** for the extension; workflows use existing `web-ext` build script.  
- **release-please-action v4** and **create-github-app-token v3** are already validated in jekyll-mermaid-prebuild; no separate POC unless local `act` simulation is needed (optional).

## Dependencies

- Repository variable `HELPER_APP_ID` and secret `HELPER_APP_PRIVATE_KEY` (operator — documented in `milestones.md`).  
- Existing `npm` scripts: `build:ext`, `lint:ext`, `ci`.

## Challenges and mitigations

- **Correct `manifest.json` bumping**: If `extra-files` is insufficient for MV2 manifest shape, check release-please issue tracker / docs for JSON generic updater; mitigate by adjusting config in build after a failing dry run.  
- **Checkout ref for release job**: Mitigate by using documented outputs from `release-please` (tag or SHA) so the XPI matches the released commit.  
- **Action version drift**: Mitigate by pinning consistently across all Tab Yeet workflows in this milestone.

## Preflight (2026-04-04)

- **Result:** PASS  
- **Convention:** Plan assumed tooling tests; operator later removed them—acceptable; extension logic unchanged per `systemPatterns.md`.  
- **Completeness:** Plan maps to `projectbrief.md` M2 (release-please, unsigned XPI on release, lockfile workflow, GitHub App token).  
- **Advisory:** Confirm `extra-files: ["manifest.json"]` (or current manifest-releaser equivalent) against [release-please manifest/package configuration](https://github.com/googleapis/release-please/blob/main/docs/manifest-releaser.md) if the first `release-please` dry run does not bump `manifest.json`.

## Status

- [x] Initialization complete
- [x] Test planning complete (superseded by operator no-tooling-test policy)
- [x] Implementation plan complete
- [x] Technology validation complete
- [x] Preflight
- [x] Build
- [x] QA
- [x] Reflect
