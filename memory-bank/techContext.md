# Tech Context

Tab Yeet is a **vanilla ES module** WebExtension targeting Firefox (Manifest V2) and Chrome/Edge (Manifest V3) from a single codebase. There is no bundler or runtime npm dependencies; only **Vitest**, **jsdom**, and **web-ext** are dev dependencies. The Firefox MV2 `manifest.json` is the source of truth; `scripts/transform-manifest.js` derives the Chrome MV3 manifest at build time. Chrome does not implement the `browser.*` namespace — the Chrome build injects a shim (`browser-shim.js`) that aliases `chrome` → `browser`.

## Testing

Tests run with **`npm test`** as configured in `package.json` and `vitest.config.js`. Shared browser mocks live in `test/setup.js`.

## Extension layout

Entry points: `manifest.json`, `popup/popup.html`, `options/options.html`. Shared logic lives under `lib/`.
