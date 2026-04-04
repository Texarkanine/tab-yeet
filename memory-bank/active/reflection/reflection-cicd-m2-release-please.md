---
task_id: cicd-m2-release-please
date: 2026-04-04
complexity_level: 2
---

# Reflection: M2 — Release-please CD pipeline

## Summary

Release-please (manifest mode, Node + `manifest.json` extra file), GitHub App–backed workflows, post-release XPI build/upload, and a release-PR `package-lock.json` updater were added. Automated `test/tooling/ci-config.test.js` was removed at operator request; validation is by code review and GitHub Actions on `main`.

## Requirements vs Outcome

Deliverables from `projectbrief.md` M2 are present: `release-please-config.json`, `.release-please-manifest.json`, `CHANGELOG.md` bootstrap, `release-please.yaml`, `update-package-lock.yaml`, README release section. Operator still must configure `HELPER_APP_ID` / `HELPER_APP_PRIVATE_KEY` on the repo before workflows can mutate branches.

## Plan Accuracy

The plan matched the shipped layout. One gap caught after initial commit: release workflows pinned Node 20 while CI used `.nvmrc` (24); fixed by switching to `actions/setup-node@v6` with `node-version-file: ".nvmrc"`.

## Build & QA Observations

Extension tests and `npm run ci` were run without the removed tooling suite. QA review focused on workflow guards (`release_created`), token pattern parity with the reference repo, and Node alignment across jobs.

## Insights

### Technical

- Keeping `setup-node` inputs identical across `ci.yaml`, `release-please.yaml`, and `update-package-lock.yaml` avoids subtle lockfile or build differences between PR CI and release builds.

### Process

- Repository policy rejected workflow-inventory tests; documenting that choice in tasks/reflection avoids future agents re-adding them without asking.

### Million-Dollar Question

If releases were assumed from day one, the same manifest-mode release-please config and a single shared composite or reusable workflow for “Node install + cache + npm ci” would reduce duplicated YAML; for a two-workflow extension repo, copy-paste with `.nvmrc` is still proportionate.
