# Tech Context

Tab Yeet is a **vanilla ES module** Firefox WebExtension (Manifest V2). There is no bundler or runtime npm dependencies; only **Vitest** and **jsdom** are used for tests.

## Testing

Tests run with **`npm test`** as configured in `package.json` and `vitest.config.js`. Shared browser mocks live in `test/setup.js`.

## Extension layout

Entry points: `manifest.json`, `popup/popup.html`, `options/options.html`. Shared logic lives under `lib/`.
