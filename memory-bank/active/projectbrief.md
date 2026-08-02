# Project Brief: Codecov coverage upload and README badge

## User Story

As a maintainer, I want Vitest coverage uploaded to Codecov from CI and a Codecov badge on the README, so that coverage is visible on the project and trends on PRs — matching the pattern used in `inquirerjs-checkbox-search`.

## Requirements

- Generate coverage with Vitest (`@vitest/coverage-v8`) and produce `lcov` for Codecov
- Upload coverage from PR CI using `codecov/codecov-action` and `secrets.CODECOV_TOKEN` (secret already present in the GitHub Actions secret store)
- Add a Codecov badge to the README
- Do not duplicate work: verify CI does not already upload coverage (confirmed: no coverage/Codecov steps in `.github/workflows/` today; CI only runs plain `npm test`)
- Follow the reference repo's general pattern without pulling in unrelated tooling (no Stryker, no coverage thresholds required for this task)

## Out of Scope

- Raising suite coverage percentages or remediating uncovered UI paths
- Mutation testing
- Changing product/extension behavior
