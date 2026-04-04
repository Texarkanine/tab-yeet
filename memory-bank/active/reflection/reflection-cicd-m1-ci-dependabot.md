---
task_id: cicd-m1-ci-dependabot
date: 2026-04-04
complexity_level: 2
---

# Reflection: M1 — CI workflow and Dependabot

## Summary

Shipped PR-gated GitHub Actions (Vitest, `web-ext lint`, `web-ext build`), Dependabot for npm and GitHub Actions, and `test/tooling/ci-config.test.js` to lock in the contract. Local `npm run ci` matches CI; `web-ext build` uses `--overwrite-dest` so repeat runs do not fail.

## Requirements vs Outcome

All Milestone 1 items from the project brief are covered: CI workflow, Dependabot ecosystems, `web-ext` devDependency and npm scripts (preflight advisory). README now documents `npm run ci`.

## Plan Accuracy

The plan matched execution. The only addition during build was `--overwrite-dest` on `web-ext build` after discovering a second `npm run ci` run failed when the zip already existed.

## Build & QA Observations

Smooth: reference repo patterns translated directly. `npx web-ext@8` POC during planning removed guesswork. QA prompted a small README update; no mechanical issues after overwrite fix.

## Insights

### Technical

- `web-ext build` defaults to refusing overwrite; for scripts that chain test → lint → build, `--overwrite-dest` avoids footguns.

### Process

- A thin Vitest file that asserts repo layout and workflow contents gives fast feedback without standing up actionlint in npm.

### Million-Dollar Question

If CI were assumed from repo creation, the same files would land earlier and `npm run ci` would appear in README step 1 — functionally what we have now, with slightly different doc ordering.
