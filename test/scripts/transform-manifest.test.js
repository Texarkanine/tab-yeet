import { describe, expect, it } from "vitest";
import { transformManifest } from "../../scripts/transform-manifest.js";

/** Minimal MV2 manifest matching the project's real manifest.json structure. */
function baseMv2() {
  return {
    manifest_version: 2,
    name: "Tab Yeet",
    version: "0.6.1",
    description: "Copy tab URLs.",
    permissions: ["tabs", "clipboardWrite", "storage"],
    browser_action: {
      default_popup: "popup/popup.html",
      default_icon: { 32: "icons/icon-32.png", 128: "icons/icon-128.png" },
    },
    options_ui: { page: "options/options.html", open_in_tab: true },
    icons: { 32: "icons/icon-32.png", 128: "icons/icon-128.png" },
    browser_specific_settings: {
      gecko: { id: "tab-yeet@webextension.cani.ne.jp" },
    },
  };
}

describe("transformManifest", () => {
  it("sets manifest_version to 3", () => {
    const result = transformManifest(baseMv2());
    expect(result.manifest_version).toBe(3);
  });

  it("renames browser_action to action with identical content", () => {
    const mv2 = baseMv2();
    const result = transformManifest(mv2);
    expect(result.action).toEqual(mv2.browser_action);
    expect(result).not.toHaveProperty("browser_action");
  });

  it("removes browser_specific_settings", () => {
    const result = transformManifest(baseMv2());
    expect(result).not.toHaveProperty("browser_specific_settings");
  });

  it("removes clipboardWrite from permissions", () => {
    const result = transformManifest(baseMv2());
    expect(result.permissions).not.toContain("clipboardWrite");
  });

  it("preserves all other fields unchanged", () => {
    const mv2 = baseMv2();
    const result = transformManifest(mv2);
    expect(result.name).toBe(mv2.name);
    expect(result.version).toBe(mv2.version);
    expect(result.description).toBe(mv2.description);
    expect(result.options_ui).toEqual(mv2.options_ui);
    expect(result.icons).toEqual(mv2.icons);
    expect(result.permissions).toContain("tabs");
    expect(result.permissions).toContain("storage");
  });

  it("does not mutate the input object", () => {
    const mv2 = baseMv2();
    const frozen = JSON.stringify(mv2);
    transformManifest(mv2);
    expect(JSON.stringify(mv2)).toBe(frozen);
  });

  it("handles manifest without browser_action", () => {
    const mv2 = baseMv2();
    delete mv2.browser_action;
    const result = transformManifest(mv2);
    expect(result).not.toHaveProperty("browser_action");
    expect(result).not.toHaveProperty("action");
  });

  it("handles manifest without browser_specific_settings", () => {
    const mv2 = baseMv2();
    delete mv2.browser_specific_settings;
    const result = transformManifest(mv2);
    expect(result).not.toHaveProperty("browser_specific_settings");
    expect(result.manifest_version).toBe(3);
  });

  it("handles permissions without clipboardWrite", () => {
    const mv2 = baseMv2();
    mv2.permissions = ["tabs", "storage"];
    const result = transformManifest(mv2);
    expect(result.permissions).toEqual(["tabs", "storage"]);
  });

  it("handles manifest without permissions", () => {
    const mv2 = baseMv2();
    delete mv2.permissions;
    const result = transformManifest(mv2);
    expect(result).not.toHaveProperty("permissions");
    expect(result.manifest_version).toBe(3);
  });
});
