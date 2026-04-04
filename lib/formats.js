/**
 * Output format map: formatKey → (title, url) => string.
 */

/**
 * @param {string} title
 * @param {string} url
 * @returns {string}
 */
function plainFormat(title, url) {
  return url ?? "";
}

/**
 * @param {string} title
 * @param {string} url
 * @returns {string}
 */
function markdownFormat(title, url) {
  const t = title ?? "";
  const u = url ?? "";
  return `- [${t}](${u})`;
}

/** @type {Record<string, (title: string, url: string) => string>} */
export const FORMATS = {
  plain: plainFormat,
  markdown: markdownFormat,
};

/**
 * Format a list of tab-like objects for clipboard output.
 * Tabs are joined with a single newline; no trailing newline.
 * Unknown format keys fall back to `plain`.
 *
 * @param {Array<{ title?: string, url?: string }>} tabs
 * @param {string} formatKey
 * @returns {string}
 */
export function formatTabs(tabs, formatKey) {
  if (!tabs?.length) return "";
  const formatter = FORMATS[formatKey] ?? FORMATS.plain;
  return tabs.map((tab) => formatter(tab.title ?? "", tab.url ?? "")).join("\n");
}
