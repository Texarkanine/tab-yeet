# Tab Yeet

Firefox / LibreWolf extension (Manifest V2): copy URLs from all tabs in the **current window**, with optional regex-based URL transforms and plain or Markdown list formatting.

## Development

1. Clone the repository. Use **Node** at the version in [`.nvmrc`](.nvmrc) (currently **24** LTS — the same line CI uses). With [nvm](https://github.com/nvm-sh/nvm): `nvm install` then `nvm use`. Install dev dependencies:

   ```bash
   npm install
   ```

2. Run tests:

   ```bash
   npm test
   ```

3. Match CI locally (Vitest, `web-ext lint`, `web-ext build`):

   ```bash
   npm run ci
   ```

4. Load the extension in Firefox:

   - Open `about:debugging#/runtime/this-firefox`
   - Click **Load Temporary Add-on…**
   - Select the project’s `manifest.json`

Use **Preferences** (gear in the popup, or the add-on’s options in `about:addons`) to edit transform rules. Rules run in order, without short-circuiting; duplicate tabs are detected **after** transforms when choosing default checkmarks for the tab list.

## Releases

Releases on `main` are automated with [release-please](https://github.com/googleapis/release-please): merge Conventional Commit messages (`feat:`, `fix:`, etc.), then merge the release PR when you are ready to tag. When a GitHub Release is created, CI builds an unsigned `.xpi` via `web-ext build` and attaches it to that release, then submits that build to [AMO](https://addons.mozilla.org/) for signing ([`kewisch/action-web-ext`](https://github.com/kewisch/action-web-ext) with `channel: listed`). The workflow packages a `sources.zip` from `git archive` for Mozilla’s source policy, forwards the GitHub Release notes, and declares **GPL-3.0-only** with the repo `LICENSE` text. If AMO returns a signed file in the job (some listed submissions finish later), that signed `.xpi` is uploaded to the GitHub Release as well.

Configure these **repository secrets**: `AMO_SIGN_KEY` (JWT issuer) and `AMO_SIGN_SECRET` (JWT secret) from the [AMO Developer Hub API credentials page](https://addons.mozilla.org/developers/addon/api/key/). The first public listing must exist on AMO before API uploads apply to your add-on; see `memory-bank/active/milestones.md` (Milestone 3).

Workflows that open or update branches (release-please and the `package-lock.json` refresh job) use the same **GitHub App** token pattern as the reference setup: set repository variable `HELPER_APP_ID` and secret `HELPER_APP_PRIVATE_KEY`. See `memory-bank/active/milestones.md` (Milestone 2) for operator notes.

## License

GPL-3.0 — see [LICENSE](LICENSE).
