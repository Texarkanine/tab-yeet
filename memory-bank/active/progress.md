# Progress

Resolve Mozilla validator warnings for Tab Yeet: migrate off deprecated `applications`, add Firefox built-in data collection consent in the manifest.

**Complexity:** Level 1

## 2026-04-04 - COMPLEXITY-ANALYSIS - COMPLETE

* Work completed
    - Determined Level 1 scope (manifest + tests only).
* Decisions made
    - Use `data_collection_permissions.required: ["none"]` — extension operates locally (tabs + clipboard + storage), no declared off-device data transmission.

## 2026-04-04 - BUILD - COMPLETE

* Work completed
    - Added `test/tooling/manifest-firefox.test.js`; migrated manifest to `browser_specific_settings` with Firefox built-in data consent; set `gecko.strict_min_version` 140.0 and `gecko_android.strict_min_version` 142.0 so `web-ext lint` accepts `data_collection_permissions`.
* Decisions made
    - Raised minimum Firefox above 109 because Mozilla ties the new manifest key to Gecko releases 140 / 142 (lint warns otherwise).

## 2026-04-04 - QA - COMPLETE

* Work completed
    - Semantic check: KISS (manifest-only + one test file); requirements satisfied; `.qa-validation-status` PASS.
