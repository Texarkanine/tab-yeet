/**
 * Browser namespace shim for Chrome builds.
 *
 * Chrome does not implement the `browser.*` namespace (Firefox/Safari only).
 * This module provides the shim content and an HTML injection utility so that
 * cross-browser extension code using `browser.*` works in Chrome without
 * modifying shared source files.
 */

/**
 * Script content that aliases `chrome` → `browser` at runtime.
 * Written to the Chrome staging directory as a standalone file and loaded
 * via a regular <script> tag before any ES module scripts.
 */
export const BROWSER_SHIM = `\
if (typeof globalThis.browser === "undefined") {
  globalThis.browser = chrome;
}
`;

/**
 * Injects a `<script src="/browser-shim.js">` tag before the first
 * `<script type="module">` in an HTML string. If no module script is
 * found, returns the HTML unchanged.
 *
 * @param {string} html - Raw HTML content.
 * @returns {string} HTML with the shim script tag injected.
 */
export function injectShimScript(html) {
  return html.replace(
    /(<script type="module")/,
    '<script src="/browser-shim.js"></script>\n    $1',
  );
}
