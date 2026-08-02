---
task_id: 20260802-lean-xpi-publish-investigate
complexity_level: 2
date: 2026-08-02
status: completed
---

# TASK ARCHIVE: Lean Firefox XPI + investigate store publish failures

## SUMMARY

Excluded store/maintainer trees (`screenshots/`, `docs/`) from Firefox `web-ext` packages with contract tests (XPI ~53KB vs ~742KB). Investigated 0.9.0 store-publish failures: AMO `unsupported_filetype` fixed by switching to `kewisch/action-web-ext@v2` (web-ext 10 native `File` under Node 24); CWS `invalid_grant` is OAuth refresh-token rejection — documented for operator secret rotation (no in-repo credential fix).

## REQUIREMENTS

- Keep Firefox/AMO XPIs lean by not packing non-runtime `screenshots/` and `docs/`
- Lock packaging with Vitest contracts (ignore markers + built XPI listing)
- Investigate AMO `unsupported_filetype` and CWS `invalid_grant` from [run 30728594885](https://github.com/Texarkanine/tab-yeet/actions/runs/30728594885); apply in-repo fixes only where justified
- Credential rotation (CWS/AMO secrets) remains an operator action

## IMPLEMENTATION

- **`web-ext-config.cjs`**: `ignoreFiles` pairs for `screenshots` / `docs` (same `dir` + `dir/**` pattern as `coverage`)
- **`test/tooling/web-ext-package.test.js`**: asserts ignore markers; runs `web-ext build` into a temp dir and checks zip listing omits those trees while retaining runtime paths + `LICENSE`
- **`.github/workflows/release-please.yaml`**: AMO sign uses `kewisch/action-web-ext@v2` instead of `texarkanine/action-web-ext@submit-timeout` (fork was on web-ext 8 `FileBlob`)
- **`docs/cws-setup.md`**: troubleshooting for CI `invalid_grant` / Bad Request at token fetch

Root cause detail (AMO): under Node 24, web-ext 8’s `FileBlob` + `FormData` drops the upload filename to `"blob"`, which AMO rejects with `unsupported_filetype`. web-ext 10 uses `new File([data], basename(...))`, which preserves `unsigned.xpi`. Screenshots bloat was real but unrelated (0.8.2 shipped bloated and signed successfully).

## TESTING

- TDD: package contract tests written red, then ignore rules made them green
- Full Vitest suite: 104 passing; `web-ext lint` clean; `npm run build:ext` OK
- `/niko-preflight` PASS; `/niko-qa` PASS (no substantive findings)
- Local Node 24 repro confirmed FileBlob → `blob` filename vs native `File` → `unsigned.xpi`

## LESSONS LEARNED

- Prefer web-ext 10+ / actions that use the native `File` constructor for AMO uploads on GitHub’s Node 24 runners; do not paper over with a permanent Node 20 opt-out when upstream already fixed it.
- Store-asset XPI bloat can coexist with successful AMO history — size alone does not explain filetype validation errors.
- Google’s “refresh token does not expire unless revoked” is incomplete for OAuth apps left in **Testing** (≈7-day kill); publishing the consent screen to **In production** is required for long-lived CI tokens, then re-consent and update secrets.
- When the operator lands the durable fix mid-build (upstream action bump), drop temporary workarounds and their contract tests rather than shipping both paths.

## PROCESS IMPROVEMENTS

- Separating packaging hygiene from store-publish investigation in the plan prevented a false “lean XPI fixes AMO” conclusion.

## TECHNICAL IMPROVEMENTS

- Optional later: Firefox stage allowlist (mirror Chrome `SOURCE_DIRS`) so non-runtime trees cannot re-enter via forgotten ignores — ignore pairs are adequate at current scale.

## NEXT STEPS

- Operator: publish OAuth consent screen to production if still Testing, re-consent, update `CWS_*` secrets as a matching set; re-run failed release publish jobs or cut a follow-up release.
- Merge branch `diagnose-pub` (or equivalent) carrying packaging + `kewisch/action-web-ext@v2` + docs.
