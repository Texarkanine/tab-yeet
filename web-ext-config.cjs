/**
 * Defaults for `web-ext` (build + lint). Loaded automatically via config discovery.
 * Keeps release packages lean and emits a Firefox-style `.xpi` (ZIP) for GitHub Releases.
 *
 * @see https://extensionworkshop.com/documentation/develop/web-ext-command-reference/#web-ext-config-file
 */
module.exports = {
  // Global: used by `web-ext build` and `web-ext lint`
  ignoreFiles: [
    // Directory entries are not matched by `dir/**` alone; exclude the dirs explicitly.
    "memory-bank",
    "memory-bank/**",
    "test",
    "test/**",
    ".github",
    ".github/**",
    ".cursor",
    ".cursor/**",
    "package.json",
    "package-lock.json",
    "vitest.config.js",
    "release-please-config.json",
    ".release-please-manifest.json",
    "web-ext-config.cjs",
    "CHANGELOG.md",
    "README.md",
    "**/*.skbd",
    ".nvmrc",
    ".gitignore",
  ],
  build: {
    filename: "{name}-{version}.xpi",
    overwriteDest: true,
  },
};
