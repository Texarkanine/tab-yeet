# Task: M2 — Release-please CD pipeline (Tab Yeet)

- **Task ID:** `cicd-m2-release-please`
- **Complexity:** Level 2
- **Type:** Simple enhancement (DevOps / release automation)

Ship release-please on `main` (Node release type), keep `package.json` and `manifest.json` versions in sync via release-please, generate changelog from Conventional Commits, and on release creation build an unsigned `.xpi` with `web-ext build` and attach it to the GitHub Release. Add a PR workflow that updates `package-lock.json` on Release Please branches (mirror `update-gemfile-lock.yaml` from jekyll-mermaid-prebuild). Use the same GitHub App token pattern (`actions/create-github-app-token` with `vars.HELPER_APP_ID` and `secrets.HELPER_APP_PRIVATE_KEY`).

## Test Plan (TDD)

### Behaviors to verify

- **release-please config present and Node-oriented**: `release-please-config.json` exists, parses as JSON, uses a Node-oriented release strategy for the root package, and names `manifest.json` as an extra file to bump so it stays aligned with `package.json`.
- **Manifest tracks released version**: `.release-please-manifest.json` exists, parses as JSON, and its root version matches `package.json`’s `version` before any new release (baseline drift guard).
- **Release workflow wires app token + release-please + XPI**: `.github/workflows/release-please.yaml` exists, triggers on push to `main`, runs `googleapis/release-please-action@v4` with the app-generated token, and includes a gated job that runs only when `release_created` is true, runs `npm ci`, `npm run build:ext`, and attaches `web-ext-artifacts/*.xpi` to the GitHub Release (via an appropriate maintained upload action, e.g. `softprops/action-gh-release` with `files` or equivalent).
- **Lockfile refresh workflow for Release PRs**: `.github/workflows/update-package-lock.yaml` (or equivalently named) exists, runs on pull requests whose head branch starts with `release-please--`, restricts file paths to version bumps (`package.json` / `manifest.json`), checks out with the app token, runs `npm install` (or `npm ci` + version-aligned refresh per chosen approach), and commits `package-lock.json` only when it changes (mirror the reference repo’s commit/retry pattern).

### Edge cases / negative cases

- **Workflow guards missing**: Tests fail if `release_created` gating is absent from the XPI job (avoid building/uploading on every `main` push).
- **Wrong ecosystem**: Lockfile workflow must not reference Ruby/Bundler; it must be npm-based for this repo.

### Test infrastructure

- **Framework:** Vitest (`npm test`), configured in `package.json` / `vitest.config.js`.
- **Test location:** Extend existing `test/tooling/ci-config.test.js` (or split into `test/tooling/github-release-config.test.js` if the file grows unwieldy — follow one file until ~clear duplication).
- **Conventions:** Node `fs` + `path` from repo root via `fileURLToPath`; `describe`/`it`/`expect` style matches M1 tests.
- **New test files:** Prefer none; add a second file only if the single file exceeds maintainability.

## Implementation plan

1. **Tests first (M2 behaviors)**  
   - **Files:** `test/tooling/ci-config.test.js` (and optionally new sibling under `test/tooling/`).  
   - **Changes:** Add failing tests for the four behavior groups above (config JSON, manifest, release workflow, lockfile workflow). Run `npm test`; confirm new tests fail.

2. **release-please configuration**  
   - **Files:** `release-please-config.json`, `.release-please-manifest.json`.  
   - **Changes:** Add Node `release-type` for package `"."`; configure `extra-files` (or documented equivalent) so `manifest.json` receives the same version bump as `package.json`. Seed `.release-please-manifest.json` with the current `0.1.0` to match `package.json` / `manifest.json`.

3. **Release Please + XPI workflow**  
   - **Files:** `.github/workflows/release-please.yaml`.  
   - **Changes:**  
     - `on.push.branches: [main]`; permissions `contents: write`, `pull-requests: write`, `issues: write` (omit `id-token: write` unless a chosen action requires OIDC — reference uses it for RubyGems, not needed here).  
     - Job `release-please` with `actions/create-github-app-token@v3` + `googleapis/release-please-action@v4`; export `release_created`, `version`, and any required SHA/tag outputs for the build job.  
     - Job `build-release-xpi` (name flexible): `if: needs.release-please.outputs.release_created`; checkout at the released revision per action outputs; `actions/setup-node@v4` with npm cache; `npm ci`; `npm run build:ext`; upload `.xpi` to the GitHub Release created by release-please.  
     - Pin actions to the same major/minor tags as the reference repo where practical; align `.github/workflows/ci.yaml` pins in this step if required to satisfy the L4 milestone invariant (“consistent pinned action version tags”).

4. **Lockfile update workflow**  
   - **Files:** `.github/workflows/update-package-lock.yaml`.  
   - **Changes:** PR trigger with `paths` for `package.json` and `manifest.json`; `if: startsWith(github.head_ref, 'release-please--')`; app token checkout; `npm install` (or documented npm command) to refresh `package-lock.json`; `nick-fields/retry@v4` commit/push loop analogous to reference (adapt git user/email pattern).

5. **Documentation**  
   - **Files:** `README.md`.  
   - **Changes:** Document that releases are driven by release-please, Conventional Commits are required on `main`, and repo `HELPER_APP_*` secrets/vars are required for workflows that mutate branches/releases. Link to Milestone 2 operator notes in `milestones.md` where helpful.

6. **Green tests + CI**  
   - **Files:** (tests from step 1).  
   - **Changes:** Implement configuration and workflows until all tests pass; run `npm test` locally.

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
- **Convention:** Tooling tests under `test/tooling/` match M1; no conflict with `systemPatterns.md` (extension logic untouched).  
- **Completeness:** Plan maps to `projectbrief.md` M2 (release-please, unsigned XPI on release, lockfile workflow, GitHub App token).  
- **Advisory:** Confirm `extra-files: ["manifest.json"]` (or current manifest-releaser equivalent) against [release-please manifest/package configuration](https://github.com/googleapis/release-please/blob/main/docs/manifest-releaser.md) if the first `release-please` dry run does not bump `manifest.json`.

## Status

- [x] Initialization complete
- [x] Test planning complete (TDD)
- [x] Implementation plan complete
- [x] Technology validation complete
- [x] Preflight
- [ ] Build
- [ ] QA
