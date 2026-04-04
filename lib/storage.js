/**
 * Centralized storage keys, default rules, and browser.storage.local helpers.
 */

/** Canonical storage keys for transform rules and format preference. */
export const STORAGE_KEYS = {
  transformRules: "transformRules",
  formatPreference: "formatPreference",
};

/** Default social/embed cleanup rules shipped on first install. */
export const DEFAULT_RULES = [
  {
    id: "default-twitter",
    pattern: String.raw`^https?://(www\.)?(x\.com|twitter\.com)/`,
    replacement: "https://fixupx.com/",
    enabled: true,
  },
  {
    id: "default-instagram",
    pattern: String.raw`^https?://(www\.)?instagram\.com/`,
    replacement: "https://eeinstagram.com/",
    enabled: true,
  },
  {
    id: "default-reddit",
    pattern: String.raw`^https?://(www\.)?reddit\.com/`,
    replacement: "https://vxreddit.com/",
    enabled: true,
  },
  {
    id: "default-tiktok",
    pattern: String.raw`^https?://(www\.)?tiktok\.com/`,
    replacement: "https://vxtiktok.com/",
    enabled: true,
  },
];

function cloneDefaultRules() {
  return DEFAULT_RULES.map((r) => ({ ...r }));
}

/**
 * Load transform rules from storage. Seeds default rules when the key is missing, null, or
 * not an array; a persisted empty array is returned as-is (user-cleared list).
 * @returns {Promise<Array<{ id: string, pattern: string, replacement: string, enabled: boolean }>>}
 */
export async function loadRules() {
  const key = STORAGE_KEYS.transformRules;
  const data = await browser.storage.local.get(key);
  const stored = data[key];
  if (stored === undefined || stored === null) {
    const seeded = cloneDefaultRules();
    await browser.storage.local.set({ [key]: seeded });
    return seeded;
  }
  if (!Array.isArray(stored)) {
    const seeded = cloneDefaultRules();
    await browser.storage.local.set({ [key]: seeded });
    return seeded;
  }
  return stored;
}

/**
 * Persist the full rule list.
 * @param {Array<{ id: string, pattern: string, replacement: string, enabled: boolean }>} rules
 * @returns {Promise<void>}
 */
export async function saveRules(rules) {
  await browser.storage.local.set({ [STORAGE_KEYS.transformRules]: rules });
}

/**
 * @returns {Promise<string>}
 */
export async function loadFormatPreference() {
  const key = STORAGE_KEYS.formatPreference;
  const data = await browser.storage.local.get(key);
  const val = data[key];
  return typeof val === "string" && val.length > 0 ? val : "plain";
}

/**
 * @param {string} key
 * @returns {Promise<void>}
 */
export async function saveFormatPreference(key) {
  await browser.storage.local.set({ [STORAGE_KEYS.formatPreference]: key });
}
