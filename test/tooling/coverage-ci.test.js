/**
 * Contract tests for Vitest coverage generation and Codecov CI upload.
 *
 * Locks the load-bearing markers that keep local coverage and GHA→Codecov
 * upload working: package scripts, vitest coverage config, CI triggers/steps,
 * and gitignore for coverage artifacts. Does not assert README prose.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import vitestConfig from "../../vitest.config.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function readRoot(relPath) {
  return readFileSync(join(root, relPath), "utf8");
}

describe("coverage CI contracts", () => {
  it("defines test:coverage that runs vitest with --coverage", () => {
    const pkg = JSON.parse(readRoot("package.json"));
    const script = pkg.scripts["test:coverage"];
    expect(script).toBeTypeOf("string");
    expect(script).toMatch(/vitest/);
    expect(script).toMatch(/--coverage/);
  });

  it("uses test:coverage in the local ci script", () => {
    const pkg = JSON.parse(readRoot("package.json"));
    expect(pkg.scripts.ci).toMatch(/test:coverage/);
  });

  it("configures v8 coverage with lcov and source includes", () => {
    const coverage = vitestConfig.test?.coverage;
    expect(coverage?.provider).toBe("v8");
    expect(coverage?.reporter).toEqual(expect.arrayContaining(["lcov"]));

    const include = coverage?.include ?? [];
    for (const dir of ["lib/", "popup/", "options/", "scripts/", "automation-scripts/"]) {
      expect(include.some((p) => p.includes(dir))).toBe(true);
    }

    const exclude = coverage?.exclude ?? [];
    for (const dir of ["test/", "node_modules/", "build/", "web-ext-artifacts/", "coverage/"]) {
      expect(exclude.some((p) => p.includes(dir))).toBe(true);
    }
  });

  it("runs CI on pull_request and push to main", () => {
    const yaml = readRoot(".github/workflows/ci.yaml");
    expect(yaml).toMatch(/pull_request:/);
    expect(yaml).toMatch(/push:/);
    expect(yaml).toMatch(/branches:\s*\n\s*-\s*main/);
  });

  it("uploads coverage to Codecov with CODECOV_TOKEN exactly once", () => {
    const yaml = readRoot(".github/workflows/ci.yaml");
    expect(yaml).toMatch(/test:coverage/);
    expect(yaml).toMatch(/codecov\/codecov-action@/);
    expect(yaml).toMatch(/secrets\.CODECOV_TOKEN/);
    expect(yaml.match(/codecov\/codecov-action@/g)).toHaveLength(1);
  });

  it("gitignores the coverage output directory", () => {
    const ignore = readRoot(".gitignore");
    expect(ignore.split(/\r?\n/).some((line) => line.trim() === "coverage/")).toBe(true);
  });

  it("excludes coverage from web-ext lint and build packages", () => {
    const config = readRoot("web-ext-config.cjs");
    expect(config).toMatch(/["']coverage["']/);
    expect(config).toMatch(/["']coverage\/\*\*["']/);
  });
});
