/**
 * Contract tests: release workflow splits AMO signing into a retryable job using artifacts.
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

  it("uploads an AMO bundle from the build job for the sign job", () => {
    expect(yaml).toMatch(/actions\/upload-artifact@v4/);
    expect(yaml).toMatch(/name:\s*amo-submit/m);
    expect(yaml).toMatch(/unsigned\.xpi/);
    expect(yaml).toMatch(/cp LICENSE amo-submit\/LICENSE/);
  });

  it("runs AMO sign in a separate job that downloads the bundle", () => {
    expect(yaml).toMatch(/actions\/download-artifact@v4/);
    expect(yaml).toMatch(/amo-submit\/unsigned\.xpi/);
    expect(yaml).toMatch(/needs:\s*(\[|-)/m);
    expect(yaml).toMatch(/build-release-xpi/);
  });

  it("does not ship a separate source archive (XPI is unminified source)", () => {
    expect(yaml).not.toContain("sourceCode:");
    expect(yaml).not.toContain("sources.zip");
    expect(yaml).not.toContain("git archive");
  });

  it("fetches release notes from GitHub API for the release tag", () => {
    expect(yaml).toContain("repos/${{ github.repository }}/releases/tags");
    expect(yaml).toMatch(/jq -r '\.body \/\/ empty'/);
  });

  it("runs kewisch/action-web-ext sign on listed channel with AMO secrets", () => {
    expect(yaml).toMatch(/uses:\s*kewisch\/action-web-ext@v1/);
    expect(yaml).toMatch(/cmd:\s*sign/);
    expect(yaml).toMatch(/channel:\s*listed/);
    expect(yaml).toContain("${{ secrets.AMO_SIGN_KEY }}");
    expect(yaml).toContain("${{ secrets.AMO_SIGN_SECRET }}");
  });

  it("declares GPL-3.0-or-later via metaDataFile custom_license (not version.license slug)", () => {
    expect(yaml).toContain("GPL-3.0-or-later");
    expect(yaml).toMatch(/custom_license/);
    expect(yaml).toMatch(/metaDataFile:\s*amo-submit\/amo-metadata\.json/);
    expect(yaml).not.toMatch(/^\s*license:\s*GPL-/m);
  });

  it("uploads signed XPI only when the sign step produced a target path", () => {
    expect(yaml).toMatch(/if:.*amo_sign\.outputs\.target/m);
    expect(yaml).toContain("${{ steps.amo_sign.outputs.target }}");
  });
});
