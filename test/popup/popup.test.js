import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  sortTabsByWindowOrder,
  detectDuplicates,
  buildCopyText,
  loadTabs,
  populateFormatSelect,
  showFeedback,
  copyToClipboard,
  renderTabList,
} from "../../popup/popup.js";

describe("sortTabsByWindowOrder", () => {
  it("orders by tab index ascending", () => {
    const tabs = [
      { index: 2, url: "c" },
      { index: 0, url: "a" },
      { index: 1, url: "b" },
    ];
    expect(sortTabsByWindowOrder(tabs).map((t) => t.url)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });
});

describe("detectDuplicates", () => {
  it("marks later indices when transformed URLs repeat (first stays unique)", () => {
    const tabs = [{}, {}, {}];
    const transformed = ["https://x", "https://y", "https://x"];
    const dup = detectDuplicates(tabs, transformed);
    expect(dup.has(2)).toBe(true);
    expect(dup.has(0)).toBe(false);
    expect(dup.has(1)).toBe(false);
  });
});

describe("loadTabs", () => {
  beforeEach(() => {
    browser.tabs.query = vi.fn().mockResolvedValue([
      { index: 1, url: "b" },
      { index: 0, url: "a" },
    ]);
  });

  it("queries the current window only and returns index-ordered tabs", async () => {
    const got = await loadTabs();
    expect(browser.tabs.query).toHaveBeenCalledWith({ currentWindow: true });
    expect(got.map((t) => t.url)).toEqual(["a", "b"]);
  });
});

describe("buildCopyText", () => {
  it("applies transforms then formats selected tabs", () => {
    const rules = [{ pattern: "a", replacement: "A" }];
    const tabs = [
      { title: "One", url: "https://a.com" },
      { title: "Two", url: "https://b.com" },
    ];
    expect(buildCopyText(tabs, rules, "markdown")).toBe(
      "- [One](https://A.com)\n- [Two](https://b.com)",
    );
  });
});

describe("popup UI helpers", () => {
  it("populateFormatSelect fills keys from FORMATS", () => {
    const sel = document.createElement("select");
    populateFormatSelect(sel);
    const values = Array.from(sel.options).map((o) => o.value);
    expect(values.sort()).toEqual(["markdown", "plain"]);
  });

  it("showFeedback sets classes and text", () => {
    const el = document.createElement("div");
    showFeedback(el, true, "Copied.");
    expect(el.textContent).toBe("Copied.");
    expect(el.classList.contains("success")).toBe(true);
    showFeedback(el, false, "Bad");
    expect(el.classList.contains("error")).toBe(true);
  });

  it("renderTabList leaves first duplicate checked and unchecks later dupes", () => {
    const list = document.createElement("ul");
    const tabs = [
      { index: 0, title: "A", url: "https://x/1" },
      { index: 1, title: "B", url: "https://x/2" },
    ];
    const transformed = ["https://u", "https://u"];
    renderTabList(list, tabs, transformed);
    const boxes = list.querySelectorAll('input[type="checkbox"]');
    expect(boxes).toHaveLength(2);
    expect(boxes[0].checked).toBe(true);
    expect(boxes[1].checked).toBe(false);
  });

  it("sets label title for full URL hover", () => {
    const list = document.createElement("ul");
    const tabs = [{ index: 0, title: "T", url: "https://long.example/path" }];
    renderTabList(list, tabs, ["https://u"]);
    const label = list.querySelector("label");
    expect(label?.getAttribute("title")).toContain("https://long.example/path");
  });
});

describe("copyToClipboard", () => {
  it("uses navigator.clipboard.writeText when available", async () => {
    navigator.clipboard.writeText = vi.fn().mockResolvedValue(undefined);
    const ok = await copyToClipboard("hello");
    expect(ok).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello");
  });

  it("falls back when clipboard.writeText throws", async () => {
    navigator.clipboard.writeText = vi.fn().mockRejectedValue(new Error("no"));
    const exec = vi.fn().mockReturnValue(true);
    document.execCommand = exec;
    const ok = await copyToClipboard("fallback");
    expect(ok).toBe(true);
    expect(exec).toHaveBeenCalledWith("copy");
  });
});
