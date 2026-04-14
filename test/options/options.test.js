import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  validateRegex,
  addRule,
  editRule,
  deleteRule,
  moveRule,
  reorderRules,
  reorderRulesToInsertionSlot,
  toggleRule,
  initAutomationScriptsTabs,
} from "../../options/options.js";

describe("validateRegex", () => {
  it("returns an error when pattern is empty", () => {
    expect(validateRegex("")).toBe("Pattern is required");
    expect(validateRegex("   ")).toBe("Pattern is required");
  });

  it("returns null for a valid pattern", () => {
    expect(validateRegex("^https://")).toBe(null);
  });

  it("returns a message for invalid regex", () => {
    expect(validateRegex("[")).not.toBe(null);
  });
});

describe("rule CRUD helpers", () => {
  const base = [
    { id: "a", pattern: "1", replacement: "1", enabled: true },
    { id: "b", pattern: "2", replacement: "2", enabled: true },
  ];

  it("addRule appends a new enabled rule", () => {
    const next = addRule(base, "x", "y");
    expect(next).toHaveLength(3);
    expect(next[2]).toMatchObject({
      pattern: "x",
      replacement: "y",
      enabled: true,
    });
    expect(next[2].id).toBeTruthy();
  });

  it("editRule updates fields for a single id", () => {
    const next = editRule(base, "b", { pattern: "Z" });
    expect(next[1].pattern).toBe("Z");
    expect(next[0].pattern).toBe("1");
  });

  it("deleteRule removes by id", () => {
    const next = deleteRule(base, "a");
    expect(next.map((r) => r.id)).toEqual(["b"]);
  });

  it("moveRule swaps with up/down", () => {
    expect(moveRule(base, "b", "up").map((r) => r.id)).toEqual(["b", "a"]);
    expect(moveRule(base, "a", "down").map((r) => r.id)).toEqual(["b", "a"]);
  });

  it("moveRule is a no-op at list edges", () => {
    expect(moveRule(base, "a", "up")).toEqual(base);
    expect(moveRule(base, "b", "down")).toEqual(base);
  });

  it("reorderRules moves an item to a new index", () => {
    const three = [
      { id: "a", pattern: "1", replacement: "1", enabled: true },
      { id: "b", pattern: "2", replacement: "2", enabled: true },
      { id: "c", pattern: "3", replacement: "3", enabled: true },
    ];
    expect(reorderRules(three, 0, 2).map((r) => r.id)).toEqual(["b", "c", "a"]);
    expect(reorderRules(three, 2, 0).map((r) => r.id)).toEqual(["c", "a", "b"]);
  });

  it("reorderRules is a no-op for same index or out-of-range indices", () => {
    expect(reorderRules(base, 0, 0)).toBe(base);
    expect(reorderRules(base, -1, 0)).toBe(base);
    expect(reorderRules(base, 0, 5)).toBe(base);
    expect(reorderRules([], 0, 0)).toEqual([]);
  });

  it("reorderRulesToInsertionSlot moves by insertion slot (gaps 0..n)", () => {
    const three = [
      { id: "a", pattern: "1", replacement: "1", enabled: true },
      { id: "b", pattern: "2", replacement: "2", enabled: true },
      { id: "c", pattern: "3", replacement: "3", enabled: true },
    ];
    expect(reorderRulesToInsertionSlot(three, 0, 3).map((r) => r.id)).toEqual([
      "b",
      "c",
      "a",
    ]);
    expect(reorderRulesToInsertionSlot(three, 2, 0).map((r) => r.id)).toEqual([
      "c",
      "a",
      "b",
    ]);
    expect(reorderRulesToInsertionSlot(three, 1, 1)).toBe(three);
    expect(reorderRulesToInsertionSlot(three, 1, 2).map((r) => r.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
    expect(reorderRulesToInsertionSlot(three, 1, 3).map((r) => r.id)).toEqual([
      "a",
      "c",
      "b",
    ]);
  });

  it("toggleRule flips enabled", () => {
    const next = toggleRule(base, "a");
    expect(next[0].enabled).toBe(false);
    expect(next[1].enabled).toBe(true);
  });
});

describe("initAutomationScriptsTabs", () => {
  /** @type {ReturnType<typeof vi.fn>} */
  let fetchSpy;

  function mockFetchResponses(map) {
    fetchSpy = vi.fn((url) => {
      const body = map[url] ?? "";
      return Promise.resolve({ ok: true, text: () => Promise.resolve(body) });
    });
    globalThis.fetch = fetchSpy;
  }

  beforeEach(() => {
    browser.runtime.getURL.mockImplementation((p) => `moz-extension://ext/${p}`);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
    delete globalThis.fetch;
  });

  it("is a no-op when container is null", async () => {
    await initAutomationScriptsTabs(null);
  });

  it("builds tab buttons and panels from the registry", async () => {
    document.body.innerHTML = '<div id="container"></div>';
    const container = document.getElementById("container");
    mockFetchResponses({
      "moz-extension://ext/automation-scripts/windows/description.html":
        "<p>Win desc</p>",
      "moz-extension://ext/automation-scripts/windows/clipboard-yeet.ahk":
        "SCRIPT_BODY",
      "moz-extension://ext/automation-scripts/linux/description.html":
        '<p class="coming-soon">Coming soon...?</p>',
      "moz-extension://ext/automation-scripts/macos/description.html":
        '<p class="coming-soon">Coming soon...?</p>',
    });

    await initAutomationScriptsTabs(container);

    const tabs = container.querySelectorAll('[role="tab"]');
    const panels = container.querySelectorAll('[role="tabpanel"]');
    expect(tabs.length).toBe(3);
    expect(panels.length).toBe(3);
    expect(tabs[0].textContent.trim()).toBe("Windows");
    expect(tabs[1].textContent.trim()).toBe("Linux");
    expect(tabs[2].textContent.trim()).toBe("macOS");
  });

  it("first tab is active by default, others hidden", async () => {
    document.body.innerHTML = '<div id="container"></div>';
    const container = document.getElementById("container");
    mockFetchResponses({
      "moz-extension://ext/automation-scripts/windows/description.html":
        "<p>Win</p>",
      "moz-extension://ext/automation-scripts/windows/clipboard-yeet.ahk":
        "AHK",
      "moz-extension://ext/automation-scripts/linux/description.html":
        "<p>Lin</p>",
      "moz-extension://ext/automation-scripts/macos/description.html":
        "<p>Mac</p>",
    });

    await initAutomationScriptsTabs(container);

    const tabs = container.querySelectorAll('[role="tab"]');
    const panels = container.querySelectorAll('[role="tabpanel"]');
    expect(panels[0].hidden).toBe(false);
    expect(panels[1].hidden).toBe(true);
    expect(panels[2].hidden).toBe(true);
    expect(tabs[0].tabIndex).toBe(0);
    expect(tabs[1].tabIndex).toBe(-1);
    expect(tabs[2].tabIndex).toBe(-1);
  });

  it("clicking a tab shows that panel and hides others", async () => {
    document.body.innerHTML = '<div id="container"></div>';
    const container = document.getElementById("container");
    mockFetchResponses({
      "moz-extension://ext/automation-scripts/windows/description.html":
        "<p>Win</p>",
      "moz-extension://ext/automation-scripts/windows/clipboard-yeet.ahk":
        "AHK",
      "moz-extension://ext/automation-scripts/linux/description.html":
        "<p>Lin</p>",
      "moz-extension://ext/automation-scripts/macos/description.html":
        "<p>Mac</p>",
    });

    await initAutomationScriptsTabs(container);

    const tabs = container.querySelectorAll('[role="tab"]');
    const panels = container.querySelectorAll('[role="tabpanel"]');

    expect(tabs[0].tabIndex).toBe(0);
    expect(tabs[1].tabIndex).toBe(-1);
    expect(tabs[2].tabIndex).toBe(-1);

    tabs[1].click();
    expect(panels[0].hidden).toBe(true);
    expect(panels[1].hidden).toBe(false);
    expect(panels[2].hidden).toBe(true);
    expect(tabs[0].getAttribute("aria-selected")).toBe("false");
    expect(tabs[1].getAttribute("aria-selected")).toBe("true");
    expect(tabs[0].tabIndex).toBe(-1);
    expect(tabs[1].tabIndex).toBe(0);
    expect(tabs[2].tabIndex).toBe(-1);

    tabs[2].click();
    expect(panels[0].hidden).toBe(true);
    expect(panels[1].hidden).toBe(true);
    expect(panels[2].hidden).toBe(false);
    expect(tabs[0].tabIndex).toBe(-1);
    expect(tabs[1].tabIndex).toBe(-1);
    expect(tabs[2].tabIndex).toBe(0);
  });

  it("injects description HTML into the panel", async () => {
    document.body.innerHTML = '<div id="container"></div>';
    const container = document.getElementById("container");
    mockFetchResponses({
      "moz-extension://ext/automation-scripts/windows/description.html":
        '<p><a href="https://docs.example">AHK docs</a></p>',
      "moz-extension://ext/automation-scripts/windows/clipboard-yeet.ahk":
        "AHK",
      "moz-extension://ext/automation-scripts/linux/description.html":
        "<p>Lin</p>",
      "moz-extension://ext/automation-scripts/macos/description.html":
        "<p>Mac</p>",
    });

    await initAutomationScriptsTabs(container);

    const winPanel = container.querySelectorAll('[role="tabpanel"]')[0];
    const link = winPanel.querySelector("a");
    expect(link).not.toBeNull();
    expect(link.getAttribute("href")).toBe("https://docs.example");
  });

  it("creates a read-only textarea with script content when scriptPath is present", async () => {
    document.body.innerHTML = '<div id="container"></div>';
    const container = document.getElementById("container");
    mockFetchResponses({
      "moz-extension://ext/automation-scripts/windows/description.html":
        "<p>Win</p>",
      "moz-extension://ext/automation-scripts/windows/clipboard-yeet.ahk":
        "SCRIPT_CONTENT_HERE",
      "moz-extension://ext/automation-scripts/linux/description.html":
        "<p>Lin</p>",
      "moz-extension://ext/automation-scripts/macos/description.html":
        "<p>Mac</p>",
    });

    await initAutomationScriptsTabs(container);

    const panels = container.querySelectorAll('[role="tabpanel"]');
    const winTextarea = panels[0].querySelector("textarea");
    expect(winTextarea).not.toBeNull();
    expect(winTextarea.readOnly).toBe(true);
    expect(winTextarea.value).toBe("SCRIPT_CONTENT_HERE");
  });

  it("rejects when fetch returns a non-OK response", async () => {
    document.body.innerHTML = '<div id="container"></div>';
    const container = document.getElementById("container");
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: () => Promise.resolve(""),
      }),
    );

    await expect(initAutomationScriptsTabs(container)).rejects.toThrow(/404/);
  });

  it("does not create a textarea for platforms without scriptPath", async () => {
    document.body.innerHTML = '<div id="container"></div>';
    const container = document.getElementById("container");
    mockFetchResponses({
      "moz-extension://ext/automation-scripts/windows/description.html":
        "<p>Win</p>",
      "moz-extension://ext/automation-scripts/windows/clipboard-yeet.ahk":
        "AHK",
      "moz-extension://ext/automation-scripts/linux/description.html":
        "<p>Lin</p>",
      "moz-extension://ext/automation-scripts/macos/description.html":
        "<p>Mac</p>",
    });

    await initAutomationScriptsTabs(container);

    const panels = container.querySelectorAll('[role="tabpanel"]');
    expect(panels[1].querySelector("textarea")).toBeNull();
    expect(panels[2].querySelector("textarea")).toBeNull();
  });
});
