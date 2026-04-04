# Active Context

## Current Task: Firefox manifest compliance (AMO warnings)
**Phase:** QA - COMPLETE

## What Was Done
- Build: `applications` → `browser_specific_settings`; `data_collection_permissions.required: ["none"]`; `gecko_android.strict_min_version` 142; desktop floor 140 for built-in consent; contract test `test/tooling/manifest-firefox.test.js`; `npm test` + `web-ext lint` (0 warnings).
- QA: PASS — scope matches brief; min-version raise is required for lint/AMO alignment, not scope creep.

## Next Step
- Operator: delete `memory-bank/active/` when satisfied; see Level 1 wrap-up message.
