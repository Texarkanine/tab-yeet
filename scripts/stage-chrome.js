#!/usr/bin/env node

/**
 * Assembles a staging directory for the Chrome MV3 build.
 *
 * Copies the extension source files, writes a transformed MV3 manifest,
 * and injects the browser namespace shim into HTML pages so that code
 * using `browser.*` works in Chrome (which only provides `chrome.*`).
 */

import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { BROWSER_SHIM, injectShimScript } from "./chrome-shim.js";
import { transformManifest } from "./transform-manifest.js";

const BUILD_DIR = "build/chrome";
const SOURCE_DIRS = ["popup", "options", "lib", "icons"];

rmSync(BUILD_DIR, { recursive: true, force: true });
mkdirSync(BUILD_DIR, { recursive: true });

for (const dir of SOURCE_DIRS) {
  cpSync(dir, `${BUILD_DIR}/${dir}`, { recursive: true });
}

const mv2 = JSON.parse(readFileSync("manifest.json", "utf8"));
const mv3 = transformManifest(mv2);
writeFileSync(`${BUILD_DIR}/manifest.json`, JSON.stringify(mv3, null, 2) + "\n");

writeFileSync(`${BUILD_DIR}/browser-shim.js`, BROWSER_SHIM);

for (const dir of SOURCE_DIRS) {
  const buildDir = join(BUILD_DIR, dir);
  for (const file of readdirSync(buildDir)) {
    if (!file.endsWith(".html")) continue;
    const filePath = join(buildDir, file);
    const html = readFileSync(filePath, "utf8");
    writeFileSync(filePath, injectShimScript(html));
  }
}

console.log(`Chrome staging directory ready: ${BUILD_DIR}/`);
