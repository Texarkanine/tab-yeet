# Task: M3 — AMO submission automation

* Task ID: `cicd-m3-amo`
* Complexity: Level 2
* Type: simple enhancement (release/CD)

Extend `.github/workflows/release-please.yaml` so that when release-please creates a GitHub Release, the workflow also submits the unsigned `.xpi` to AMO via `kewisch/action-web-ext` (`cmd: sign`, `channel: listed`), attaches a **source code** archive per [Mozilla source submission policy](https://extensionworkshop.com/documentation/publish/source-code-submission/), sets **release notes** from the GitHub Release body, declares **GPLv3** for the version (see [AMO license list](https://mozilla.github.io/addons-server/topics/api/licenses.html#license-list)), and **uploads the signed `.xpi` back to the GitHub Release** when the sign step produces an artifact (listed add-ons may complete signing asynchronously — the action documents this).

## Test Plan (TDD)

### Behaviors to Verify

- **[CI contract]**: The release workflow file on disk declares an AMO sign step using `kewisch/action-web-ext`, `cmd: sign`, `channel: listed`, and wires `secrets.AMO_SIGN_KEY` / `secrets.AMO_SIGN_SECRET` (names aligned with `projectbrief.md`).
- **[CI contract]**: The workflow declares source submission for sign (`sourceCode` or equivalent per action README) and documents or encodes GPLv3 (`license` and/or `licenseFile` pointing at repo `LICENSE`).
- **[CI contract]**: Release notes are taken from the GitHub Release for the tag (e.g. `gh release view` / `github.event` / release-please outputs — implementation chooses one concrete approach; tests assert the chosen pattern exists in YAML so it cannot drift silently).
- **[Regression]**: `npm run ci` still passes; `test/tooling/extension-package.test.js` still passes (XPI contents unchanged by this milestone except via normal version bumps).
- **[Edge case]**: Plan documents behavior when AMO does not return a signed file immediately (action continues; conditional upload of signed asset).

### Test Infrastructure

- **Framework**: Vitest (`npm test`), `@vitest-environment node` where needed (see `test/tooling/extension-package.test.js`).
- **Test location**: `test/tooling/`
- **Conventions**: Describe / `it` blocks; read repo files with `fs` + `path` from repo root derived from `import.meta.url`.
- **New test files**: `test/tooling/release-workflow-amo.test.js` — asserts the above contracts by reading `.github/workflows/release-please.yaml` as text (no new YAML parser dependency unless already present).

## Implementation Plan

1. **Stub failing contract test** (`test/tooling/release-workflow-amo.test.js`)
   - **Files**: new file under `test/tooling/`
   - **Changes**: Read workflow text; `expect` substrings / regexes for `kewisch/action-web-ext`, `cmd: sign`, `listed`, `AMO_SIGN_KEY`, `AMO_SIGN_SECRET`, source-code submission field, license, and release-notes mechanism. Run `npm test -- release-workflow-amo` — must fail until workflow updated.

2. **Checkout depth for `git archive`**
   - **Files**: `.github/workflows/release-please.yaml`
   - **Changes**: On the `build-release-xpi` job, set `actions/checkout` `fetch-depth: 0` (or otherwise ensure `git archive` at the release tag is reliable). Document why in a one-line comment in YAML if comments are acceptable in this repo.

3. **Source archive step**
   - **Files**: `.github/workflows/release-please.yaml`
   - **Changes**: After checkout, before or after `npm run build:ext`, add a step that creates `sources.zip` (or `.zip` name the action will use) via `git archive --format=zip --output=... "$GITHUB_REF_NAME"` or equivalent at the tagged revision — match `kewisch/action-web-ext` `sourceCode` input.

4. **Release notes from GitHub Release**
   - **Files**: `.github/workflows/release-please.yaml`
   - **Changes**: Because the job is triggered by `push` to `main` (not `release: published`), add a step that resolves the GitHub Release **body** for `needs.release-please.outputs.tag_name` (e.g. `gh release view <tag> --json body`) and passes it into the sign step (`releaseNotes` input) or into a generated `metaDataFile` — **tests lock in whichever string pattern is chosen**.

5. **AMO sign step**
   - **Files**: `.github/workflows/release-please.yaml`
   - **Changes**: Add `kewisch/action-web-ext` with `cmd: sign`, `source` pointing at the built `.xpi` (explicit path glob or step output), `sourceCode` pointing at the archive, `channel: listed`, `apiKey`/`apiSecret` from secrets, `license` set to the SPDX id AMO expects for GPLv3 (validate against Mozilla license list; use `licenseFile: LICENSE` only if required for custom text). Set reasonable `timeout`. Preserve existing unsigned `softprops/action-gh-release` attach behavior.

6. **Attach signed XPI when present**
   - **Files**: `.github/workflows/release-please.yaml`
   - **Changes**: After sign, if the action exposes an output path (e.g. `steps.<id>.outputs.target`), run a conditional upload (second `softprops/action-gh-release` or `gh release upload`) so a produced signed `.xpi` is attached without failing the job when no file is returned yet (per action docs for listed async review).

7. **Documentation**
   - **Files**: `README.md` (and `memory-bank/active/projectbrief.md` only if prerequisites change)
   - **Changes**: Document `AMO_SIGN_KEY` / `AMO_SIGN_SECRET` repository secrets, first-time AMO / manual listing expectation from milestone list, and that listed signing may be asynchronous.

8. **Green tests**
   - **Changes**: Run `npm test` / `npm run ci`; iterate until contract test and existing suite pass.

## Technology Validation

No new **npm** dependencies. **New technology**: `kewisch/action-web-ext` at a **pinned major tag** (e.g. `@v1` per action README examples) — verify latest recommended tag in action repo during build; no local POC required beyond workflow YAML.

## Dependencies

- GitHub repo secrets: `AMO_SIGN_KEY`, `AMO_SIGN_SECRET` (see `projectbrief.md` / milestones).
- Operator: Mozilla account, API key issuance, initial manual listing if not already done (`milestones.md` M3 operator actions).
- Upstream: [kewisch/action-web-ext](https://github.com/kewisch/action-web-ext), [web-ext sign reference](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/#web-ext-sign).

## Challenges & Mitigations

- **Shallow checkout breaks `git archive`**: Use `fetch-depth: 0` on the release build job checkout.
- **No `github.event.release.body` on push workflow**: Explicit `gh release view` (or release-please outputs if available) — implementation step 4; test encodes the chosen approach.
- **Listed channel async signing**: Use non-fatal conditional upload; document in README; align with action README guidance.
- **License string must match AMO API**: Pick id from official license list; if tests only check substring, use the same literal in YAML and test.

## Status

- [x] Initialization complete
- [x] Test planning complete (TDD)
- [x] Implementation plan complete
- [x] Technology validation complete
- [x] Preflight
- [ ] Build
- [ ] QA
