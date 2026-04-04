/**
 * Pure URL transform engine: applies regex replacement rules in order.
 */

/**
 * Apply an ordered list of transform rules to a single URL.
 * Invalid regex patterns are skipped. Disabled rules are skipped.
 * All rules run sequentially; each rule sees the output of the previous rule.
 *
 * @param {string} url
 * @param {Array<{ pattern: string, replacement: string, enabled?: boolean }>} rules
 * @returns {string}
 */
export function applyTransforms(url, rules) {
  if (rules == null || rules.length === 0) return url;
  let out = url ?? "";
  for (const rule of rules) {
    if (rule.enabled === false) continue;
    const { pattern, replacement } = rule;
    if (pattern == null) continue;
    const repl = replacement ?? "";
    try {
      const re = new RegExp(pattern);
      out = out.replace(re, repl);
    } catch {
      // Invalid pattern: skip rule.
    }
  }
  return out;
}

/**
 * Apply {@link applyTransforms} to each URL in order.
 *
 * @param {string[]} urls
 * @param {Array<{ pattern: string, replacement: string, enabled?: boolean }>} rules
 * @returns {string[]}
 */
export function transformUrls(urls, rules) {
  if (!urls?.length) return [];
  return urls.map((u) => applyTransforms(u, rules));
}
