import { describe, expect, it } from "vitest";
import { FORMATS, formatTabs } from "../../lib/formats.js";

describe("FORMATS", () => {
  it("includes exactly plain and markdown keys", () => {
    expect(Object.keys(FORMATS).sort()).toEqual(["markdown", "plain"]);
  });

  it("plain returns the URL only", () => {
    expect(FORMATS.plain("Title", "https://x")).toBe("https://x");
  });

  it("markdown returns a markdown list item", () => {
    expect(FORMATS.markdown("Hi", "https://x")).toBe("- [Hi](https://x)");
  });
});

describe("formatTabs", () => {
  it("returns an empty string for an empty tab list", () => {
    expect(formatTabs([], "plain")).toBe("");
  });

  it("joins multiple tabs with a single newline and no trailing newline", () => {
    const tabs = [
      { title: "A", url: "https://a" },
      { title: "B", url: "https://b" },
    ];
    expect(formatTabs(tabs, "plain")).toBe("https://a\nhttps://b");
  });

  it("uses the selected formatter per format key", () => {
    const tabs = [{ title: "T", url: "https://u" }];
    expect(formatTabs(tabs, "markdown")).toBe("- [T](https://u)");
  });

  it("falls back to plain for unknown format keys", () => {
    const tabs = [{ title: "T", url: "https://u" }];
    expect(formatTabs(tabs, "no-such-key")).toBe("https://u");
  });

  it("treats missing title/url as empty strings", () => {
    expect(formatTabs([{}], "markdown")).toBe("- []()");
  });
});
