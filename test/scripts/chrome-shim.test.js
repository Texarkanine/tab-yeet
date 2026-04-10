import { describe, expect, it } from "vitest";
import { BROWSER_SHIM, injectShimScript } from "../../scripts/chrome-shim.js";

describe("BROWSER_SHIM", () => {
  it("defines browser as chrome when browser is undefined", () => {
    expect(BROWSER_SHIM).toContain("browser");
    expect(BROWSER_SHIM).toContain("chrome");
  });

  it("is guarded so it does not overwrite an existing browser namespace", () => {
    expect(BROWSER_SHIM).toMatch(/typeof|undefined/);
  });
});

describe("injectShimScript", () => {
  it("inserts a script tag before the first <script type=\"module\">", () => {
    const html = '<body>\n    <script type="module" src="popup.js"></script>\n</body>';
    const result = injectShimScript(html);
    expect(result).toContain('<script src="/browser-shim.js"></script>');
    const shimPos = result.indexOf('<script src="/browser-shim.js">');
    const modulePos = result.indexOf('<script type="module"');
    expect(shimPos).toBeLessThan(modulePos);
  });

  it("preserves all other HTML content", () => {
    const html =
      '<!DOCTYPE html>\n<html>\n<head><title>Test</title></head>\n<body>\n    <script type="module" src="app.js"></script>\n</body>\n</html>';
    const result = injectShimScript(html);
    expect(result).toContain("<title>Test</title>");
    expect(result).toContain('<script type="module" src="app.js">');
  });

  it("handles HTML with no module script (returns unchanged)", () => {
    const html = "<body><p>No scripts here</p></body>";
    const result = injectShimScript(html);
    expect(result).toBe(html);
  });

  it("only injects once even if multiple module scripts exist", () => {
    const html =
      '<script type="module" src="a.js"></script>\n<script type="module" src="b.js"></script>';
    const result = injectShimScript(html);
    const matches = result.match(/browser-shim\.js/g);
    expect(matches).toHaveLength(1);
  });
});
