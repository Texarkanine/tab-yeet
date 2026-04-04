# Project Brief

## User Story

As an extension maintainer, I want the WebExtension manifest to satisfy current Firefox submission checks so that Tab Yeet passes Mozilla’s security/validation warnings.

## Use-Case(s)

### Use-Case 1

AMO or `web-ext` lint reports no deprecation warning for `applications` and includes the required built-in data consent declaration.

## Requirements

1. Replace deprecated `applications` with `browser_specific_settings` (Gecko id and existing `strict_min_version` preserved).
2. Add `browser_specific_settings.gecko.data_collection_permissions` as required by Firefox for new/updated extensions.
3. Declare accurate data collection: extension does not collect or transmit data outside the local browser (`required: ["none"]` per Extension Workshop).

## Constraints

1. Keep `manifest_version` 2 unless explicitly migrated (out of scope).
2. Follow project TDD and verification (lint/format/test).

## Acceptance Criteria

1. `manifest.json` has no `applications` key.
2. `manifest.json` includes `browser_specific_settings.gecko` with id, `strict_min_version`, and `data_collection_permissions`.
3. Automated test asserts the above contract.
4. Full test suite passes.
