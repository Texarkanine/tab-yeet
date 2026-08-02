# Project Brief

## Goal

Keep Firefox/AMO release XPIs lean by excluding non-runtime packaging (store screenshots and maintainer docs), and determine why the 0.9.0 store-publish jobs failed so we know what to fix next.

## Requirements

1. Exclude `screenshots/` and `docs/` from `web-ext` Firefox builds (and any other non-runtime paths found that should not ship in the XPI).
2. Add/extend contract tests so regressions that re-pack those paths fail CI.
3. Investigate AMO sign failure (`unsupported_filetype`) and CWS publish failure (`invalid_grant`) from [run 30728594885](https://github.com/Texarkanine/tab-yeet/actions/runs/30728594885); document root causes and apply in-repo fixes only where the investigation shows code/config changes belong in this repo.

## Out of scope

- Rotating Google/AMO credentials in GitHub Secrets (operator action) unless investigation proves a repo-side config bug.
- Redesigning the dual-target build pipeline beyond ignore/allowlist packaging hygiene.
