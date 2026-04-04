# Task: M1 — CI workflow and Dependabot

- Task ID: cicd-m1-ci-dependabot
- Complexity: Level 2
- Type: Simple enhancement (DevOps / repo automation)

Deliver PR-gated GitHub Actions that run the existing Vitest suite, `web-ext lint`, and `web-ext build`, plus Dependabot configuration for `npm` and `github-actions` aligned with the jekyll-mermaid-prebuild reference (grouping, commit-message prefixes, weekly schedule).


## Test Plan (TDD)

### Behaviors to Verify

- [CI / Vitest]: On a pull request to `main`, the workflow runs `npm ci` and `npm test`; the job succeeds when all Vitest tests pass.
- [CI / web-ext lint]: The same workflow runs `npm run lint:ext`; the job succeeds when `web-ext lint` exits zero for the extension rooted at the repo (current manifest: notices/warnings allowed; errors fail CI).
- [CI / web-ext build]: The workflow runs `npm run build:ext`; the job succeeds when a packaged artifact is produced under a dedicated artifacts directory (no untracked junk in the repo root).
- [Dependabot]: `.github/dependabot.yaml` defines `npm` and `github-actions` updates on a weekly schedule with grouped minor/patch updates and conventional commit-message prefixes consistent with the reference project.
- [Local parity]: After implementation, a developer can run the same checks locally via `npm test`, `npm run lint:ext`, and `npm run build:ext` (optional composite `npm run ci`).

### Test Infrastructure

- Framework: Vitest (existing unit/integration tests under `test/`)
- Test location: `test/**/*.test.js`, `vitest.config.js`, `test/setup.js`
- Conventions: ES modules, jsdom environment, shared mocks in `test/setup.js`
- New test files: none required for this milestone — correctness of workflow and Dependabot config is validated by a green PR check on GitHub and local execution of npm scripts

## Implementation Plan

1. Add `web-ext` as a devDependency and npm scripts for extension lint/build (and optional `ci` aggregate).
   - Files: `package.json`, `package-lock.json`
   - Changes: `"lint:ext": "web-ext lint --source-dir ."`, `"build:ext": "web-ext build --source-dir . --artifacts-dir web-ext-artifacts"`, optional `"ci": "npm test && npm run lint:ext && npm run build:ext"`. Pin major line compatible with POC (`web-ext@8`).

2. Ignore packaged-output directory used by `web-ext build`.
   - Files: `.gitignore`
   - Changes: Add `web-ext-artifacts/` (and ensure no `.zip` artifacts land in repo root).

3. Add PR workflow mirroring reference naming and triggers.
   - Files: `.github/workflows/ci.yaml`
   - Changes: `pull_request` on `main`; job on `ubuntu-latest`; `actions/checkout@v4`; `actions/setup-node@v4` with `node-version: '20'` and `cache: npm`; run `npm ci`, `npm test`, `npm run lint:ext`, `npm run build:ext`. Use `.yaml` extension per preflight convention.

4. Add Dependabot for npm and GitHub Actions.
   - Files: `.github/dependabot.yaml`
   - Changes: `version: 2`; `package-ecosystem: npm` with `directory: '/'`, weekly schedule (e.g. Monday 09:00 UTC), groups for minor/patch consistent with reference intent; `package-ecosystem: github-actions` with grouped action updates; `open-pull-requests-limit`, assignee `Texarkanine`, `commit-message` prefixes `fix(deps)` / `chore(deps-dev)` / `chore(deps-ci)` matching reference patterns.

## Technology Validation

- `web-ext@8`: Verified via `npx web-ext@8 lint --source-dir .` (exit 0; 0 errors) and `npx web-ext@8 build --source-dir . --artifacts-dir <temp>` (produced `tab_yeet-0.1.0.zip`).
- New runtime dependencies for the extension: none — `web-ext` is dev-only.

## Dependencies

- Node 20.x in CI (LTS; matches common Actions defaults)
- `web-ext` CLI (devDependency)
- GitHub Actions runners and Dependabot (platform)

## Challenges & Mitigations

- **web-ext lint notices/warnings**: Current manifest triggers valid notices/warnings but no errors; CI should use default lint failure policy (errors fail). If future manifest changes introduce errors, CI correctly fails — fix manifest or allowlist per Mozilla guidance.
- **No `package-lock.json` policy**: Use `npm ci` in CI — requires a committed lockfile; generate/update lockfile when adding `web-ext`.
- **Artifact directory hygiene**: Always pass `--artifacts-dir web-ext-artifacts` and gitignore it so `web-ext build` does not dirty the working tree.

## Status

- [x] Initialization complete
- [x] Test planning complete (TDD)
- [x] Implementation plan complete
- [x] Technology validation complete
- [ ] Preflight
- [ ] Build
- [ ] QA
