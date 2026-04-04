import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  DEFAULT_RULES,
  STORAGE_KEYS,
  loadFormatPreference,
  loadRules,
  saveFormatPreference,
  saveRules,
} from "../../lib/storage.js";

function createMemoryStore() {
  /** @type {Record<string, unknown>} */
  const data = {};
  return {
    data,
    get: vi.fn(async (keys) => {
      if (typeof keys === "string") {
        return { [keys]: data[keys] };
      }
      if (Array.isArray(keys)) {
        const out = {};
        for (const k of keys) out[k] = data[k];
        return out;
      }
      return { ...data };
    }),
    set: vi.fn(async (items) => {
      Object.assign(data, items);
    }),
  };
}

describe("storage constants", () => {
  it("exports canonical storage keys", () => {
    expect(STORAGE_KEYS.transformRules).toBe("transformRules");
    expect(STORAGE_KEYS.formatPreference).toBe("formatPreference");
  });

  it("DEFAULT_RULES contains exactly four social transforms", () => {
    expect(DEFAULT_RULES).toHaveLength(4);
    expect(DEFAULT_RULES.map((r) => r.id)).toEqual([
      "default-twitter",
      "default-instagram",
      "default-reddit",
      "default-tiktok",
    ]);
  });
});

describe("loadRules / saveRules", () => {
  let mem;

  beforeEach(() => {
    mem = createMemoryStore();
    browser.storage.local.get = mem.get;
    browser.storage.local.set = mem.set;
  });

  it("seeds and persists default rules when storage is empty", async () => {
    const rules = await loadRules();
    expect(rules).toHaveLength(4);
    expect(rules[0].pattern).toContain("twitter");
    expect(mem.data[STORAGE_KEYS.transformRules]).toHaveLength(4);
  });

  it("returns stored rules when present", async () => {
    const custom = [
      { id: "1", pattern: "a", replacement: "b", enabled: true },
    ];
    mem.data[STORAGE_KEYS.transformRules] = custom;
    const rules = await loadRules();
    expect(rules).toEqual(custom);
  });

  it("does not re-seed when the user saved an empty rule list", async () => {
    mem.data[STORAGE_KEYS.transformRules] = [];
    const rules = await loadRules();
    expect(rules).toEqual([]);
  });

  it("saveRules writes the full list", async () => {
    const next = [
      { id: "x", pattern: "p", replacement: "r", enabled: false },
    ];
    await saveRules(next);
    expect(mem.data[STORAGE_KEYS.transformRules]).toEqual(next);
  });
});

describe("format preference", () => {
  let mem;

  beforeEach(() => {
    mem = createMemoryStore();
    browser.storage.local.get = mem.get;
    browser.storage.local.set = mem.set;
  });

  it('defaults to "plain" when unset', async () => {
    expect(await loadFormatPreference()).toBe("plain");
  });

  it("returns saved format key", async () => {
    mem.data[STORAGE_KEYS.formatPreference] = "markdown";
    expect(await loadFormatPreference()).toBe("markdown");
  });

  it("saveFormatPreference persists the key", async () => {
    await saveFormatPreference("markdown");
    expect(mem.data[STORAGE_KEYS.formatPreference]).toBe("markdown");
  });
});
