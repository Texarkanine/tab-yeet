import { describe, expect, it } from "vitest";
import {
  BLOCK_FORMATS,
  FORMATS,
  FORMAT_LABELS,
  FORMAT_ORDER,
  escapeHtml,
  formatTabs,
} from "../../lib/formats.js";

describe("FORMATS", () => {
  it("includes line-format keys", () => {
    expect(Object.keys(FORMATS).sort()).toEqual([
      "html_link",
      "markdown",
      "markdown_url",
      "plain",
    ]);
  });

  it("plain returns the URL only", () => {
    expect(FORMATS.plain("Title", "https://x")).toBe("https://x");
  });

  it("markdown returns a markdown list item with link text", () => {
    expect(FORMATS.markdown("Hi", "https://x")).toBe("- [Hi](https://x)");
  });

  it("markdown_url returns a markdown list item with URL only", () => {
    expect(FORMATS.markdown_url("Ignored", "https://x")).toBe("- https://x");
  });

  it("html_link returns an anchor tag with escaped text", () => {
    expect(FORMATS.html_link('A & B', 'https://x?q=1&2')).toBe(
      '<a href="https://x?q=1&amp;2">A &amp; B</a>',
    );
  });
});

describe("BLOCK_FORMATS", () => {
  it("includes html_ul_urls and html_ul_links", () => {
    expect(Object.keys(BLOCK_FORMATS).sort()).toEqual([
      "html_ul_links",
      "html_ul_urls",
    ]);
  });
});

describe("FORMAT_ORDER and FORMAT_LABELS", () => {
  it("has a label for every ordered format key", () => {
    for (const key of FORMAT_ORDER) {
      expect(typeof FORMAT_LABELS[key]).toBe("string");
      expect(FORMAT_LABELS[key].length).toBeGreaterThan(0);
    }
  });

  it("uses distinct labels for markdown URL-only vs markdown link list formats", () => {
    // Display copy is allowed to change; only require two different strings.
    expect(FORMAT_LABELS.markdown_url).not.toBe(FORMAT_LABELS.markdown);
  });
});

describe("escapeHtml", () => {
  it("escapes ampersands and angle brackets for HTML contexts", () => {
    expect(escapeHtml(`<a href="x">y & z"`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;y &amp; z&quot;",
    );
  });
});

describe("formatTabs", () => {
  it("returns an empty string for an empty tab list", () => {
    expect(formatTabs([], "plain")).toBe("");
    expect(formatTabs([], "html_ul_urls")).toBe("");
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
    expect(formatTabs(tabs, "markdown_url")).toBe("- https://u");
  });

  it("formats html_ul_urls as a ul block", () => {
    const tabs = [
      { title: "A", url: "https://a" },
      { title: "B", url: "https://b?x=1&2" },
    ];
    expect(formatTabs(tabs, "html_ul_urls")).toBe(
      `<ul>\n<li>https://a</li>\n<li>https://b?x=1&amp;2</li>\n</ul>`,
    );
  });

  it("formats html_ul_links as a ul block with anchors", () => {
    const tabs = [
      { title: "A & B", url: "https://a" },
      { title: "C", url: "https://b" },
    ];
    expect(formatTabs(tabs, "html_ul_links")).toBe(
      `<ul>\n<li><a href="https://a">A &amp; B</a></li>\n<li><a href="https://b">C</a></li>\n</ul>`,
    );
  });

  it("falls back to plain for unknown format keys", () => {
    const tabs = [{ title: "T", url: "https://u" }];
    expect(formatTabs(tabs, "no-such-key")).toBe("https://u");
  });

  it("treats missing title/url as empty strings", () => {
    expect(formatTabs([{}], "markdown")).toBe("- []()");
    expect(formatTabs([{}], "markdown_url")).toBe("- ");
    expect(formatTabs([{}], "html_link")).toBe('<a href=""></a>');
  });
});
