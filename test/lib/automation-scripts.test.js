import { describe, expect, it } from "vitest";
import {
  AUTOHOTKEY_V2_DOCS_URL,
  WINDOWS_CLIPBOARD_YEET_AHK,
} from "../../lib/automation-scripts.js";

describe("automation-scripts", () => {
  it("exports an AutoHotkey v2 documentation URL", () => {
    expect(AUTOHOTKEY_V2_DOCS_URL).toMatch(/^https:\/\//);
    expect(AUTOHOTKEY_V2_DOCS_URL).toContain("autohotkey.com");
  });

  it("includes the clipboard yeet hotkey and delay constant", () => {
    expect(WINDOWS_CLIPBOARD_YEET_AHK.length).toBeGreaterThan(50);
    expect(WINDOWS_CLIPBOARD_YEET_AHK).toContain("^!+v");
    expect(WINDOWS_CLIPBOARD_YEET_AHK).toContain("DELAY_MS");
  });
});
