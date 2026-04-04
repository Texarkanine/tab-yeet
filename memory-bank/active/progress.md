# Progress

Resolve Mozilla validator warnings for Tab Yeet: migrate off deprecated `applications`, add Firefox built-in data collection consent in the manifest.

**Complexity:** Level 1

## 2026-04-04 - COMPLEXITY-ANALYSIS - COMPLETE

* Work completed
    - Determined Level 1 scope (manifest + tests only).
* Decisions made
    - Use `data_collection_permissions.required: ["none"]` — extension operates locally (tabs + clipboard + storage), no declared off-device data transmission.
