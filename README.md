# Tab Yeet

Firefox / LibreWolf extension (Manifest V2): copy URLs from all tabs in the **current window**, with optional regex-based URL transforms and plain or Markdown list formatting.

## Development

1. Clone the repository.

2. Install dev dependencies:

   ```bash
   npm install
   ```

3. Run tests:

   ```bash
   npm test
   ```

4. Match CI locally (Vitest, `web-ext lint`, `web-ext build`):

   ```bash
   npm run ci
   ```

5. Load the extension in Firefox:

   - Open `about:debugging#/runtime/this-firefox`
   - Click **Load Temporary Add-on…**
   - Select the project's `manifest.json`

Use **Preferences** (gear in the popup, or the add-on's options in `about:addons`) to edit transform rules. Rules run in order, without short-circuiting; duplicate tabs are detected **after** transforms when choosing default checkmarks for the tab list.

## Releases

Releases on `main` are automated with [release-please](https://github.com/googleapis/release-please): merge Conventional Commit messages (`feat:`, `fix:`, etc.), then merge the release PR when you are ready to tag. When a GitHub Release is created, CI builds an unsigned `.xpi` via `web-ext build` and attaches it to that release, then submits that build to [AMO](https://addons.mozilla.org/) for signing ([`kewisch/action-web-ext`](https://github.com/kewisch/action-web-ext) with `channel: listed`).
