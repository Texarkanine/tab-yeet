import { readFileSync, existsSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

describe("CI tooling config", () => {

  it("package.json defines web-ext and extension scripts", () => {
    const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
    expect(pkg.devDependencies?.["web-ext"]).toBeDefined();
    expect(pkg.scripts?.["lint:ext"]).toMatch(/web-ext lint/);
    expect(pkg.scripts?.["build:ext"]).toMatch(/web-ext build/);
    expect(pkg.scripts?.["build:ext"]).toContain("--overwrite-dest");
  });

  it("ignores web-ext build output directory", () => {
    const gitignore = readFileSync(resolve(root, ".gitignore"), "utf8");
    expect(gitignore).toContain("web-ext-artifacts");
  });

  it("has PR CI workflow with npm ci, test, lint, and build", () => {
    const p = resolve(root, ".github/workflows/ci.yaml");
    expect(existsSync(p)).toBe(true);
    const y = readFileSync(p, "utf8");
    expect(y).toContain("npm ci");
    expect(y).toContain("npm test");
    expect(y).toMatch(/npm run lint:ext/);
    expect(y).toMatch(/npm run build:ext/);
    expect(y).toContain("node-version-file:");
    expect(y).toContain(".nvmrc");
    expect(y).not.toMatch(/node-version:\s*["']?20/);
  });

  it("has dependabot for npm and github-actions", () => {
    const p = resolve(root, ".github/dependabot.yaml");
    expect(existsSync(p)).toBe(true);
    const y = readFileSync(p, "utf8");
    expect(y).toContain("package-ecosystem: npm");
    expect(y).toContain("package-ecosystem: github-actions");
  });
});
