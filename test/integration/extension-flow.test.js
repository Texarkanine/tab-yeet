import { describe, it, expect } from "vitest";
import { transformUrls } from "../../lib/transforms.js";
import { formatTabs } from "../../lib/formats.js";
import { STORAGE_KEYS } from "../../lib/storage.js";
import { buildCopyText } from "../../popup/popup.js";

describe("cross-component flow", () => {
  it("uses a stable storage key for rules shared by options and popup", () => {
    expect(STORAGE_KEYS.transformRules).toBe("transformRules");
    expect(STORAGE_KEYS.formatPreference).toBe("formatPreference");
  });

  it("end-to-end: query-shaped tabs → transform → dedupe logic → format", () => {
    const rules = [{ pattern: "example\\.com", replacement: "ex.com" }];
    const tabs = [
      { title: "A", url: "https://example.com/1" },
      { title: "B", url: "https://example.com/2" },
    ];
    const text = buildCopyText(tabs, rules, "plain");
    expect(text).toBe("https://ex.com/1\nhttps://ex.com/2");
  });

  it("transform then markdown format matches manual pipeline", () => {
    const rules = [{ pattern: "a", replacement: "A" }];
    const tabs = [{ title: "Hi", url: "tap" }];
    const transformed = transformUrls([tabs[0].url], rules);
    const rows = [{ title: tabs[0].title, url: transformed[0] }];
    expect(formatTabs(rows, "markdown")).toBe("- [Hi](tAp)");
  });
});
