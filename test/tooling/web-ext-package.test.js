/**
 * Contract tests for Firefox web-ext packaging hygiene.
 *
 * Locks ignoreFiles markers and asserts a real `web-ext build` XPI does not
 * ship store/maintainer trees (screenshots/, docs/) while retaining runtime
 * paths and LICENSE. Mirrors the coverage ignore contract style.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function readRoot(relPath) {
  return readFileSync(join(root, relPath), "utf8");
}

function listZipEntries(zipPath) {
  return execFileSync("unzip", ["-Z1", zipPath], { encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean);
}

describe("web-ext package contracts", () => {
  /** @type {string | undefined} */
  let artifactsDir;

  afterEach(() => {
    if (artifactsDir) {
      rmSync(artifactsDir, { recursive: true, force: true });
      artifactsDir = undefined;
    }
  });

  it("excludes screenshots and docs from web-ext ignoreFiles (dir + /** pairs)", () => {
    const config = readRoot("web-ext-config.cjs");
    for (const dir of ["screenshots", "docs"]) {
      expect(config).toMatch(new RegExp(`["']${dir}["']`));
      expect(config).toMatch(new RegExp(`["']${dir}\\/\\*\\*["']`));
    }
  });

  it("built Firefox XPI omits screenshots/docs and keeps runtime paths + LICENSE", () => {
    artifactsDir = mkdtempSync(join(tmpdir(), "tab-yeet-xpi-"));
    execFileSync(
      "npx",
      [
        "web-ext",
        "build",
        "--source-dir",
        ".",
        "--artifacts-dir",
        artifactsDir,
        "--overwrite-dest",
      ],
      { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    );

    const xpis = readdirSync(artifactsDir).filter((f) => f.endsWith(".xpi"));
    expect(xpis.length).toBe(1);

    const entries = listZipEntries(join(artifactsDir, xpis[0]));
    expect(entries.some((e) => e === "manifest.json" || e.startsWith("manifest.json"))).toBe(true);
    expect(entries.some((e) => e.startsWith("popup/"))).toBe(true);
    expect(entries.some((e) => e.startsWith("options/"))).toBe(true);
    expect(entries.some((e) => e.startsWith("lib/"))).toBe(true);
    expect(entries.some((e) => e.startsWith("icons/"))).toBe(true);
    expect(entries.some((e) => e.startsWith("automation-scripts/"))).toBe(true);
    expect(entries).toContain("LICENSE");

    expect(entries.some((e) => e === "screenshots" || e.startsWith("screenshots/"))).toBe(false);
    expect(entries.some((e) => e === "docs" || e.startsWith("docs/"))).toBe(false);
  });
});
