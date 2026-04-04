import { describe, it, expect } from "vitest";
import {
  validateRegex,
  addRule,
  editRule,
  deleteRule,
  moveRule,
  toggleRule,
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

  it("toggleRule flips enabled", () => {
    const next = toggleRule(base, "a");
    expect(next[0].enabled).toBe(false);
    expect(next[1].enabled).toBe(true);
  });
});
