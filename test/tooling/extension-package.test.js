/**
 * Contract tests for `npm run build:ext`: release artifact name and zip contents.
 *
 * @vitest-environment node
 */
import { execSync } from "node:child_process";
import { readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const artifactsDir = path.join(root, "web-ext-artifacts");

function listXpiEntries(xpiPath) {
  const out = execSync(`unzip -Z1 "${xpiPath}"`, { encoding: "utf8" });
  return out.split("\n").filter(Boolean);
}

describe("extension package (web-ext build)", () => {
  beforeAll(() => {
    rmSync(artifactsDir, { recursive: true, force: true });
    execSync("npm run build:ext", { cwd: root, stdio: "inherit" });
  });

  it("produces exactly one .xpi artifact", () => {
    const names = readdirSync(artifactsDir).filter((n) => n.endsWith(".xpi"));
    expect(names).toHaveLength(1);
    expect(names[0]).toMatch(/^tab_yeet-\d+\.\d+\.\d+\.xpi$/);
    expect(readdirSync(artifactsDir).some((n) => n.endsWith(".zip"))).toBe(false);
  });

  it("packages only extension runtime files", () => {
    const xpiName = readdirSync(artifactsDir).find((n) => n.endsWith(".xpi"));
    expect(xpiName).toBeDefined();
    const xpiPath = path.join(artifactsDir, xpiName);
    const entries = listXpiEntries(xpiPath).map((e) => e.replace(/\\/g, "/"));

    const forbiddenPrefixes = [
      "memory-bank/",
      "test/",
      ".github/",
      ".cursor/",
    ];
    for (const p of forbiddenPrefixes) {
      const hits = entries.filter((e) => e === p || e.startsWith(p));
      expect(hits, `entries must not be under ${p}`).toEqual([]);
    }

    const forbiddenFiles = [
      "package.json",
      "package-lock.json",
      "vitest.config.js",
      "release-please-config.json",
      ".release-please-manifest.json",
      "web-ext-config.cjs",
      "CHANGELOG.md",
      "README.md",
    ];
    for (const f of forbiddenFiles) {
      expect(entries, f).not.toContain(f);
    }
    expect(entries.some((e) => e.endsWith(".skbd"))).toBe(false);

    expect(entries).toContain("manifest.json");
    expect(entries.some((e) => e.startsWith("icons/"))).toBe(true);
    expect(entries.some((e) => e.startsWith("lib/"))).toBe(true);
    expect(entries.some((e) => e.startsWith("popup/"))).toBe(true);
    expect(entries.some((e) => e.startsWith("options/"))).toBe(true);
    expect(entries).toContain("LICENSE");
  });
});
