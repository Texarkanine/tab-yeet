# Milestones: cicd-pipeline

## Cross-milestone invariants & constraints

- `manifest.json` version and `package.json` version must remain in sync at every milestone boundary
- All workflows use consistent, pinned action version tags (e.g., `@v4`, `@v1`)
- Conventional Commits are required on all merges to `main` from this point forward (release-please depends on this)
- No workflow may commit secrets, API keys, or credentials; all sensitive values come from GitHub Secrets/Variables
- Each milestone's workflows must be independently functional — later milestones extend but do not break earlier ones

## Operator actions by milestone

### Milestone 1
- No out-of-band operator actions required. All files are repo-local configuration.

### Milestone 2
- **Create a GitHub App** (or reuse the existing one from jekyll-mermaid-prebuild) for release-please bot tokens. Configure repo variables `HELPER_APP_ID` and repo secret `HELPER_APP_PRIVATE_KEY` on the tab-yeet repository.
- **Choose a production addon ID** to replace `tab-yeet@local.dev` in `manifest.json`. Convention is `addon-name@your-domain` (e.g., `tab-yeet@texarkanine.github.io` or an email-style ID). Communicate your choice before M2 build begins, or I will use `tab-yeet@texarkanine.github.io` as a default.

### Milestone 3
- **Create a Mozilla developer account** at https://addons.mozilla.org/developers/
- **Generate AMO API credentials** (JWT key + secret) from the AMO Developer Hub at https://addons.mozilla.org/en-US/developers/addon/api/key/
- **Configure GitHub Secrets** on the tab-yeet repository: `AMO_SIGN_KEY` (API key) and `AMO_SIGN_SECRET` (API secret)
- **Perform the initial manual submission** of the extension to AMO (first listing must be created manually before the API can submit subsequent versions). This can be done after M2 produces the first release with an unsigned `.xpi`.

## Execution Order

- [x] Add CI workflow (Vitest + web-ext lint + web-ext build) and Dependabot configuration for npm and GitHub Actions ecosystems
- [x] Add release-please configuration, release workflow with unsigned .xpi attachment, and package-lock.json update workflow for release PRs — matching the jekyll-mermaid-prebuild reference flow
- [ ] Add AMO submission automation to the release workflow using kewisch/action-web-ext sign (listed channel) with source code archive and GPLv3 license, attaching signed .xpi to the GitHub release when available
