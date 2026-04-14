import { describe, expect, it } from "vitest";
import { PLATFORMS } from "../../automation-scripts/registry.js";

describe("PLATFORMS registry", () => {
  it("exports a non-empty array", () => {
    expect(Array.isArray(PLATFORMS)).toBe(true);
    expect(PLATFORMS.length).toBeGreaterThan(0);
  });

  it("every entry has id, label, and descriptionPath", () => {
    for (const p of PLATFORMS) {
      expect(typeof p.id).toBe("string");
      expect(p.id.length).toBeGreaterThan(0);
      expect(typeof p.label).toBe("string");
      expect(p.label.length).toBeGreaterThan(0);
      expect(typeof p.descriptionPath).toBe("string");
      expect(p.descriptionPath).toMatch(/\.html$/);
    }
  });

  it("windows entry has a scriptPath", () => {
    const win = PLATFORMS.find((p) => p.id === "windows");
    expect(win).toBeDefined();
    expect(typeof win.scriptPath).toBe("string");
    expect(win.scriptPath).toMatch(/\.ahk$/);
  });

  it("linux and macos entries have no scriptPath", () => {
    const linux = PLATFORMS.find((p) => p.id === "linux");
    const macos = PLATFORMS.find((p) => p.id === "macos");
    expect(linux).toBeDefined();
    expect(macos).toBeDefined();
    expect(linux.scriptPath).toBeUndefined();
    expect(macos.scriptPath).toBeUndefined();
  });

  it("has unique IDs", () => {
    const ids = PLATFORMS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
