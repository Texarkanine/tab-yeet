#!/usr/bin/env node

/**
 * Assembles a staging directory for the Chrome MV3 build.
 *
 * Copies the extension source files and writes a transformed MV3 manifest
 * to build/chrome/, ready for web-ext build or web-ext lint.
 */

import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

console.log(`Chrome staging directory ready: ${BUILD_DIR}/`);
