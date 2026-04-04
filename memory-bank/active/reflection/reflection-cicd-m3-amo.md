---
task_id: cicd-m3-amo
date: 2026-04-04
complexity_level: 2
---

# Reflection: M3 — AMO submission automation

## Summary

Release workflow now signs the built `.xpi` with AMO (listed) via `kewisch/action-web-ext`, uploads `sources.zip` from `git archive`, forwards GitHub Release notes from the REST API, declares GPLv3 for the version, and conditionally attaches a signed `.xpi` when the action returns one. Contract tests guard the YAML shape in `test/tooling/release-workflow-amo.test.js`.

## Requirements vs Outcome

`projectbrief.md` M3 is covered: AMO sign on release, source archive, release notes, GPLv3, signed asset when available, README operator notes for `AMO_SIGN_*` secrets. First-time manual AMO listing remains an operator prerequisite per milestones.

## Plan Accuracy

The plan’s sequence held. The main surprise was upstream, not the plan: `kewisch/action-web-ext` treats `GPL-3.0-only` as a custom license (its `KNOWN_LICENSES` set is a short allowlist), so `licenseFile: LICENSE` was required alongside the SPDX name—documented in progress/activeContext.

## Build & QA Observations

Build and QA were straightforward once the license path was chosen. Contract tests avoid reintroducing a broad removed `ci-config` style while still locking AMO-related workflow strings.

## Insights

### Technical

- When integrating third-partyActions that wrap AMO metadata, validate behavior against the action’s source (e.g. license allowlist), not only Mozilla’s public API docs—the two can disagree.

### Process

- After QA on Level 2, the workflow requires **continuing into Reflect** by loading `level2-reflect.mdc`, not stopping and instructing the operator to run `/niko-reflect` manually. Skipping that breaks the intended autonomous phase chain and leaves the sub-run formally incomplete until reflection is written.

### Million-Dollar Question

If AMO signing were a day-one requirement, a single reusable workflow (or composite action) for “checkout tag + Node + build XPI + source archive + sign + publish assets” would shrink duplicated boilerplate; for one extension repo with one release workflow, inline steps are still readable.
