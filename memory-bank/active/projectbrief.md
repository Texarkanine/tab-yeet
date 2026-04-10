# Project Brief: Chromium (MV3) Support for Tab Yeet

## User Story

As the maintainer of Tab Yeet, I want to ship a Manifest V3 build for Chromium browsers (Chrome, Edge) alongside the existing Manifest V2 Firefox build, so that Tab Yeet reaches both browser ecosystems from a single codebase.

## Requirements

1. **One codebase, two packaging pathways**: The shared source (`lib/`, `popup/`, `options/`) remains unified. A build step produces two extension packages:
   - MV2 `.xpi` for Firefox/LibreWolf (existing)
   - MV3 `.zip` for Chrome Web Store (new)

2. **No separate "tab-yeet for Chromium"**: No second repo, no forked branding, no separate npm package. One extension, one name, two distribution targets.

3. **Manifest V3 compatibility**: Handle MV2→MV3 differences (`browser_action` → `action`, drop `browser_specific_settings`, etc.) and ensure `browser.*` API calls work in Chromium.

4. **Dual-target release pipeline**: Extend release-please CI/CD to publish to both AMO (already working) and Chrome Web Store on release.

5. **Account & secret guidance**: Document exactly which accounts to create, where, and which repo secrets to configure for CWS publishing.

## Constraints

- Must not break existing Firefox/AMO publishing
- Must preserve GPLv3 licensing
- Keep the extension's zero-network-permissions posture
- Prefer minimal tooling additions (no heavy bundler if avoidable)
