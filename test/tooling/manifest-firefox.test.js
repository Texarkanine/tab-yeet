/**
 * Firefox / AMO manifest expectations (deprecated keys, data consent).
 *
 * @vitest-environment node
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

describe("manifest.json (Firefox)", () => {
  const manifest = JSON.parse(readFileSync(path.join(root, "manifest.json"), "utf8"));

  it("does not use deprecated applications (use browser_specific_settings for Gecko)", () => {
    expect(manifest, "applications is deprecated; use browser_specific_settings.gecko").not.toHaveProperty(
      "applications",
    );
  });

  it("declares Gecko settings and built-in data collection consent", () => {
    expect(manifest.browser_specific_settings).toBeDefined();
    const gecko = manifest.browser_specific_settings.gecko;
    expect(gecko).toBeDefined();
    expect(gecko.id).toBe("tab-yeet@webextension.cani.ne.jp");
    expect(gecko.strict_min_version).toBe("109.0");
    expect(gecko.data_collection_permissions).toEqual({
      required: ["none"],
    });
  });
});
