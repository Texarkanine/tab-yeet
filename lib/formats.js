/**
 * Output format map: formatKey → (title, url) => string for line-based formats.
 * Block formats (HTML lists) are handled inside {@link formatTabs}.
 */

/**
 * @param {string} s
 * @returns {string}
 */
export function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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

/**
 * Markdown list item with URL only: `- url`
 * @param {string} _title
 * @param {string} url
 * @returns {string}
 */
function markdownUrlFormat(_title, url) {
  const u = url ?? "";
  return `- ${u}`;
}

/**
 * Single HTML anchor per tab.
 * @param {string} title
 * @param {string} url
 * @returns {string}
 */
function htmlLinkFormat(title, url) {
  const t = escapeHtml(title);
  const u = escapeHtml(url ?? "");
  return `<a href="${u}">${t}</a>`;
}

/**
 * @param {Array<{ title?: string, url?: string }>} tabs
 * @returns {string}
 */
function formatHtmlUlUrls(tabs) {
  const lines = tabs.map((tab) => {
    const u = escapeHtml(tab.url ?? "");
    return `<li>${u}</li>`;
  });
  return `<ul>\n${lines.join("\n")}\n</ul>`;
}

/**
 * @param {Array<{ title?: string, url?: string }>} tabs
 * @returns {string}
 */
function formatHtmlUlLinks(tabs) {
  const lines = tabs.map((tab) => {
    const t = escapeHtml(tab.title ?? "");
    const u = escapeHtml(tab.url ?? "");
    return `<li><a href="${u}">${t}</a></li>`;
  });
  return `<ul>\n${lines.join("\n")}\n</ul>`;
}

/** @type {Record<string, (title: string, url: string) => string>} */
export const FORMATS = {
  plain: plainFormat,
  markdown: markdownFormat,
  markdown_url: markdownUrlFormat,
  html_link: htmlLinkFormat,
};

/** Full-document (block) formatters keyed by format id. */
/** @type {Record<string, (tabs: Array<{ title?: string, url?: string }>) => string>} */
export const BLOCK_FORMATS = {
  html_ul_urls: formatHtmlUlUrls,
  html_ul_links: formatHtmlUlLinks,
};

/**
 * User-visible labels per format key. **Key order** is the popup &lt;select&gt; order
 * (see {@link FORMAT_ORDER}).
 */
export const FORMAT_LABELS = {
  plain: "Plain URLs",
  /** One `- url` line per tab; title is ignored. */
  markdown_url: "Markdown List of URLs",
  /** One `- [title](url)` line per tab. */
  markdown: "Markdown List of Links",
  html_link: "HTML Links",
  html_ul_urls: "HTML List of URLs",
  html_ul_links: "HTML List of Links",
};

/** Display order for the popup format &lt;select&gt; — derived from {@link FORMAT_LABELS} key order. */
export const FORMAT_ORDER = Object.keys(FORMAT_LABELS);

/**
 * Format a list of tab-like objects for clipboard output.
 * Tabs are joined with a single newline for line formats; no trailing newline.
 * Unknown format keys fall back to `plain`.
 *
 * @param {Array<{ title?: string, url?: string }>} tabs
 * @param {string} formatKey
 * @returns {string}
 */
export function formatTabs(tabs, formatKey) {
  if (!tabs?.length) return "";
  const block = BLOCK_FORMATS[formatKey];
  if (block) return block(tabs);
  const formatter = FORMATS[formatKey] ?? FORMATS.plain;
  return tabs.map((tab) => formatter(tab.title ?? "", tab.url ?? "")).join("\n");
}
