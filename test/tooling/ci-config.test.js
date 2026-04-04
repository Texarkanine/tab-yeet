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
    expect(y).toMatch(/actions\/upload-artifact@v4/);
    expect(y).toContain("web-ext-artifacts");
  });

  it("has dependabot for npm and github-actions", () => {
    const p = resolve(root, ".github/dependabot.yaml");
    expect(existsSync(p)).toBe(true);
    const y = readFileSync(p, "utf8");
    expect(y).toContain("package-ecosystem: npm");
    expect(y).toContain("package-ecosystem: github-actions");
  });
});

describe("M2 release tooling config", () => {
  it("release-please manifest config is Node with manifest.json extra file", () => {
    const p = resolve(root, "release-please-config.json");
    expect(existsSync(p)).toBe(true);
    const cfg = JSON.parse(readFileSync(p, "utf8"));
    expect(cfg.packages?.["."]?.["release-type"]).toBe("node");
    expect(cfg.packages?.["."]?.["extra-files"]).toContain("manifest.json");
  });

  it(".release-please-manifest.json root version matches package.json", () => {
    const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
    const manPath = resolve(root, ".release-please-manifest.json");
    expect(existsSync(manPath)).toBe(true);
    const manifest = JSON.parse(readFileSync(manPath, "utf8"));
    expect(manifest["."]).toBe(pkg.version);
  });

  it("CHANGELOG.md exists for node release type", () => {
    expect(existsSync(resolve(root, "CHANGELOG.md"))).toBe(true);
  });

  it("has release-please workflow with app token, release job outputs, and gated XPI build", () => {
    const p = resolve(root, ".github/workflows/release-please.yaml");
    expect(existsSync(p)).toBe(true);
    const y = readFileSync(p, "utf8");
    expect(y).toContain("googleapis/release-please-action@v4");
    expect(y).toContain("actions/create-github-app-token@v3");
    expect(y).toContain("HELPER_APP_ID");
    expect(y).toContain("HELPER_APP_PRIVATE_KEY");
    expect(y).toContain("release_created");
    expect(y).toContain("tag_name");
    expect(y).toMatch(/if:.*release_created/s);
    expect(y).toContain("npm ci");
    expect(y).toMatch(/npm run build:ext/);
    expect(y).toContain("softprops/action-gh-release@v2");
    expect(y).toContain("web-ext-artifacts");
  });

  it("has release PR workflow that refreshes package-lock.json with npm (not Ruby)", () => {
    const p = resolve(root, ".github/workflows/update-package-lock.yaml");
    expect(existsSync(p)).toBe(true);
    const y = readFileSync(p, "utf8");
    expect(y).toContain("package.json");
    expect(y).toContain("manifest.json");
    expect(y).toContain("release-please--");
    expect(y).toMatch(/npm (install|ci)/);
    expect(y.toLowerCase()).not.toContain("bundle ");
    expect(y).toContain("package-lock.json");
    expect(y).toContain("actions/create-github-app-token@v3");
  });
});
