/**
 * Contract tests: release workflow includes AMO signing (listed), secrets, source archive,
 * release notes from GitHub API, and conditional signed artifact upload.
 *
 * @vitest-environment node
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const workflowPath = path.join(root, ".github/workflows/release-please.yaml");

describe("release workflow (AMO / release-please)", () => {
  const yaml = readFileSync(workflowPath, "utf8");

  it("checks out the release tag with full history for git archive", () => {
    expect(yaml).toContain("fetch-depth: 0");
  });

  it("creates a source zip via git archive for AMO sourceCode", () => {
    expect(yaml).toMatch(/git archive.*sources\.zip/s);
  });

  it("fetches release notes from GitHub API for the release tag", () => {
    expect(yaml).toContain("repos/${{ github.repository }}/releases/tags");
  });

  it("runs kewisch/action-web-ext sign on listed channel with AMO secrets", () => {
    expect(yaml).toMatch(/uses:\s*kewisch\/action-web-ext@v1/);
    expect(yaml).toMatch(/cmd:\s*sign/);
    expect(yaml).toMatch(/channel:\s*listed/);
    expect(yaml).toContain("${{ secrets.AMO_SIGN_KEY }}");
    expect(yaml).toContain("${{ secrets.AMO_SIGN_SECRET }}");
    expect(yaml).toContain("source: ${{ steps.xpi_path.outputs.path }}");
  });

  it("derives sign XPI path from manifest name+version (web-ext safeFileName rules)", () => {
    expect(yaml).toMatch(/def safe:/);
    expect(yaml).toMatch(/\.name \| safe/);
    expect(yaml).toMatch(/\.version \| safe/);
    expect(yaml).toContain('"web-ext-artifacts/"');
  });

  it("submits GPLv3-or-later license and source archive to AMO (AMO slug + action KNOWN_LICENSES)", () => {
    expect(yaml).toMatch(/sourceCode:\s*sources\.zip/);
    expect(yaml).toMatch(/license:\s*GPL-3\.0-or-later/);
    expect(yaml).not.toContain("licenseFile:");
  });

  it("uploads signed XPI only when the sign step produced a target path", () => {
    expect(yaml).toMatch(/if:.*amo_sign\.outputs\.target/m);
    expect(yaml).toContain("${{ steps.amo_sign.outputs.target }}");
  });
});
