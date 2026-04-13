/**
 * Transforms a Firefox Manifest V2 extension manifest into a Chrome Manifest V3
 * manifest. The MV2 manifest.json remains the source of truth; this function
 * produces a derivative suitable for Chrome Web Store packaging.
 *
 * Key transformations:
 * - manifest_version 2 → 3
 * - browser_action → action
 * - browser_specific_settings removed (Firefox-only)
 * - clipboardWrite permission removed (unnecessary for Clipboard API in Chrome MV3 popups)
 *
 * @param {object} mv2 - A parsed Manifest V2 JSON object.
 * @returns {object} A new Manifest V3 JSON object (input is not mutated).
 */
export function transformManifest(mv2) {
  const mv3 = structuredClone(mv2);

  mv3.manifest_version = 3;

  if (mv3.browser_action) {
    mv3.action = mv3.browser_action;
    delete mv3.browser_action;
  }

  delete mv3.browser_specific_settings;

  if (mv3.permissions) {
    mv3.permissions = mv3.permissions.filter((p) => p !== "clipboardWrite");
  }

  return mv3;
}
