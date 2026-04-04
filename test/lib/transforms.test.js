import { describe, expect, it } from "vitest";
import { applyTransforms, transformUrls } from "../../lib/transforms.js";
import { DEFAULT_RULES } from "../../lib/storage.js";

describe("applyTransforms", () => {
  it("returns the URL unchanged when the rule list is empty", () => {
    expect(applyTransforms("https://a.com/x", [])).toBe("https://a.com/x");
  });

  it("applies a single matching rule", () => {
    const rules = [{ pattern: "foo", replacement: "bar" }];
    expect(applyTransforms("https://foo.com/", rules)).toBe("https://bar.com/");
  });

  it("applies multiple rules sequentially (output of rule N feeds rule N+1)", () => {
    const rules = [
      { pattern: "^a", replacement: "b" },
      { pattern: "^b", replacement: "c" },
    ];
    expect(applyTransforms("abc", rules)).toBe("cbc");
  });

  it("skips disabled rules", () => {
    const rules = [
      { pattern: "foo", replacement: "bar", enabled: false },
      { pattern: "foo", replacement: "baz" },
    ];
    expect(applyTransforms("foo", rules)).toBe("baz");
  });

  it("leaves the URL unchanged when no rule matches", () => {
    const rules = [{ pattern: "^nope$", replacement: "x" }];
    expect(applyTransforms("https://a.com/", rules)).toBe("https://a.com/");
  });

  it("supports backreferences in the replacement string", () => {
    const rules = [{ pattern: "(foo)(bar)", replacement: "$2-$1" }];
    expect(applyTransforms("foobarbaz", rules)).toBe("bar-foobaz");
  });

  it("skips rules with invalid regex patterns without throwing", () => {
    const rules = [
      { pattern: "[", replacement: "x" },
      { pattern: "b", replacement: "B" },
    ];
    expect(applyTransforms("abc", rules)).toBe("aBc");
  });

  it("uses empty string when replacement is missing", () => {
    const rules = [{ pattern: "x" }];
    expect(applyTransforms("axa", rules)).toBe("aa");
  });
});

describe("transformUrls", () => {
  it("maps applyTransforms across all URLs", () => {
    const rules = [{ pattern: "a", replacement: "A" }];
    expect(transformUrls(["a", "ba"], rules)).toEqual(["A", "bA"]);
  });

  it("returns an empty array for an empty input list", () => {
    expect(transformUrls([], [{ pattern: "x", replacement: "y" }])).toEqual([]);
  });
});

describe("default social rules", () => {
  it("transforms Twitter/X URLs for embedding", () => {
    expect(
      applyTransforms("https://twitter.com/user/status/1", DEFAULT_RULES),
    ).toBe("https://fixupx.com/user/status/1");
    expect(applyTransforms("https://x.com/foo", DEFAULT_RULES)).toBe(
      "https://fixupx.com/foo",
    );
  });

  it("transforms Instagram, Reddit, and TikTok URLs", () => {
    expect(
      applyTransforms("https://instagram.com/p/abc", DEFAULT_RULES),
    ).toBe("https://instagramez.com/p/abc");
    expect(
      applyTransforms("https://www.reddit.com/r/x/y", DEFAULT_RULES),
    ).toBe("https://vxreddit.com/r/x/y");
    expect(
      applyTransforms("https://tiktok.com/@u/video/1", DEFAULT_RULES),
    ).toBe("https://vxtiktok.com/@u/video/1");
  });
});
