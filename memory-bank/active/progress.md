# Progress: M3 — AMO submission automation

Extend the release workflow so that on GitHub Release creation the extension is submitted to addons.mozilla.org via `kewisch/action-web-ext` (listed channel), with source archive, GPLv3 license metadata, release notes from the GitHub release body, and signed `.xpi` attached when AMO returns it.

**Complexity:** Level 2

## Phase History

- **COMPLEXITY-ANALYSIS**: Complete. M3 classified Level 2: CI/CD enhancement extending the existing release-please flow; touches workflows, optional repo docs, and external AMO/GitHub secrets—same class as M2, not a multi-subsystem redesign.
- **PLAN**: Complete. `memory-bank/active/tasks.md` populated with TDD contracts, ordered workflow steps (checkout depth, source archive, release notes, sign, conditional upload), README updates, and challenges.
- **PREFLIGHT**: PASS. Plan matches `test/tooling/` conventions; operator removed generic `ci-config.test.js` — replacement is scoped AMO contract test only. Advisory: confirm GPLv3 SPDX id against Mozilla license list when authoring YAML; optional pin of `kewisch/action-web-ext` to commit SHA for supply chain.
- **BUILD**: Complete. `.github/workflows/release-please.yaml`: `fetch-depth: 0`, `sources.zip` via `git archive`, `gh api` release body → AMO release notes, `kewisch/action-web-ext@v1` sign with `GPL-3.0-only` + `licenseFile: LICENSE` (required because action’s `KNOWN_LICENSES` omits `-only` slugs), conditional `softprops` upload of signed XPI. New `test/tooling/release-workflow-amo.test.js`. README release/AMO secrets section updated.
- **QA**: PASS. Plan requirements met; GPLv3 path is intentional given action whitelist; contract tests align with YAML; no speculative extras. `npm run ci` green.
