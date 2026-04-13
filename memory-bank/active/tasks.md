# Task: Drag-to-reorder transform rules

* Task ID: drag-reorder-rules
* Complexity: Level 2
* Type: Simple enhancement

Replace Up/Down buttons on the options page with drag-and-drop reordering using a drag handle, backed by a pure `reorderRules(rules, fromIndex, toIndex)` helper and existing `saveRules` / `loadRules`.

## Test Plan (TDD)

### Behaviors to Verify

- [x] `reorderRules` moves an item from `fromIndex` to `toIndex` in a single step (list order matches user expectation for drop-on-row).
- [x] `reorderRules` returns the original array reference when `fromIndex === toIndex` or indices are out of range (matches `moveRule` no-op style).
- [x] `reorderRules` handles multi-item lists (not only adjacent swaps).

### Test Infrastructure

- Framework: Vitest (`npm test`)
- Test location: `test/options/options.test.js`
- Conventions: existing `describe` / `it` style alongside `moveRule` tests

## Implementation Plan

1. **Pure reorder helper + tests**
   - Files: `options/options.js`, `test/options/options.test.js`
   - Changes: export `reorderRules`; add unit tests; keep `moveRule` unchanged.

2. **Options UI: remove Up/Down, add handle + DnD**
   - Files: `options/options.js`, `options/options.css`
   - Changes: remove Up/Down buttons; add per-row drag handle (`draggable`); delegate `dragover`/`drop` on `#rules` so drops work when the pointer is over inputs; `dragstart` sets rule id in `dataTransfer`; on `drop`, compute indices and call `reorderRules`, then `saveRules` + `renderRules`. Add minimal styles (handle cursor, dragging opacity).

3. **Verification**
   - Run `npm test`, `npm run lint:firefox`, `npm run build:ext` (or project CI equivalent).

## Technology Validation

No new technology — validation not required.

## Dependencies

- None (HTML5 drag-and-drop, existing Vitest).

## Challenges & Mitigations

- **DnD vs text fields:** Use a dedicated drag handle only; delegate drop to the list container with `closest('.rule-card')` so dropping over inputs still targets the row.
- **Duplicate listeners:** Register list-level `dragover`/`drop` once in `init`, not on every `renderRules`.

## Status

- [x] Initialization complete
- [x] Test planning complete (TDD)
- [x] Implementation plan complete
- [x] Technology validation complete
- [x] Preflight
- [x] Build
- [x] QA
- [x] Reflect
