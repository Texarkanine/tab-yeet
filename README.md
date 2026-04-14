# Tab Yeet

Browser extension: copy URLs from all tabs in the **current window**, with optional regex-based URL transforms and multiple output formats (plain, Markdown, and HTML).

* [🦊 Install for Firefox-compatible browsers](https://addons.mozilla.org/firefox/addon/tab-yeet/)
* [🦁 Install for Brave, Edge, Chrome, & other Chromium-compatible browsers](https://chromewebstore.google.com/detail/tab-yeet/fdgoaejobhndllbeggippcakdlmopdle)

In addition, the raw `.xpi` and `.zip` files are available for manual installation from the [Releases](https://github.com/Texarkanine/tab-yeet/releases) page.

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

4. Build for a single target:

   ```bash
   npm run build:firefox   # → web-ext-artifacts/tab_yeet-<version>.xpi
   npm run build:chrome    # → web-ext-artifacts/tab_yeet-<version>-chrome.zip
   ```

5. Match CI locally (Vitest, `web-ext lint`, both builds):

   ```bash
   npm run ci
   ```

6. Load the extension for testing:

   **Firefox**: Open `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on…** → select `manifest.json`.

   **Chrome**: Open `chrome://extensions` → enable **Developer mode** → **Load unpacked** → select the `build/chrome/` directory (run `npm run stage:chrome` first).

Use **Preferences** (gear in the popup, or the add-on's options) to edit transform rules. Rules run in order, without short-circuiting; duplicate tabs are detected **after** transforms when choosing default checkmarks for the tab list.

### Build architecture

The Firefox MV2 `manifest.json` at the project root is the source of truth. The Chrome MV3 manifest is generated at build time by `scripts/transform-manifest.js`, which handles the MV2→MV3 differences (e.g., `browser_action` → `action`, removing Firefox-specific fields). The staging script (`scripts/stage-chrome.js`) assembles a clean build directory at `build/chrome/` with the transformed manifest, extension source files, and a `browser-shim.js` that aliases `chrome` → `browser` (Chrome does not implement the `browser.*` namespace).

> **Note:** `web-ext lint` is Firefox-centric and reports false positives for Chrome manifests (e.g., missing addon ID). Only Firefox is linted in CI; Chrome validation happens at Chrome Web Store upload time.

## Releases

Releases on `main` are automated with [release-please](https://github.com/googleapis/release-please): merge Conventional Commit messages (`feat:`, `fix:`, etc.), then merge the release PR when you are ready to tag.

When a GitHub Release is created, CI builds both the Firefox `.xpi` and Chrome `.zip` and attaches them to the release. From there, two publishing jobs run in parallel:

- **Firefox / AMO** — the unsigned `.xpi` is submitted to [AMO](https://addons.mozilla.org/) for signing ([`kewisch/action-web-ext`](https://github.com/kewisch/action-web-ext) with `channel: listed`).
- **Chrome Web Store** — the `.zip` is uploaded and published to the [Chrome Web Store](https://chromewebstore.google.com/) via the CWS API. This job is optional; if the CWS secrets are not configured, it is skipped and the Firefox/AMO pipeline proceeds independently.
