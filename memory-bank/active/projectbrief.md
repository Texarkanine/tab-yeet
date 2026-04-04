# Project Brief: CI/CD Pipeline for Tab Yeet

## User Story

As a Tab Yeet extension developer, I want a complete CI/CD and release infrastructure so that the extension is automatically tested, packaged, released via GitHub Releases (with release-please), and submitted to addons.mozilla.org for review and signing.

## Requirements

### Milestone 1: CI Pipeline + Dependabot
- PR-gated GitHub Actions workflow: run Vitest tests, lint with `web-ext lint`, build with `web-ext build`
- Dependabot for `npm` + `github-actions` ecosystems (same grouping/prefix pattern as jekyll-mermaid-prebuild reference)

### Milestone 2: Release-please CD Pipeline
- release-please configured for Node release type, bumping versions in both `package.json` and `manifest.json`
- Changelog generation from Conventional Commits
- On release creation: build unsigned `.xpi` and attach as GitHub Release asset
- `package-lock.json` update workflow for release-please PRs (mirrors reference project's `update-gemfile-lock.yaml`)
- Same GitHub App token pattern as reference project

### Milestone 3: AMO Submission Automation
- On release creation: submit packaged extension to AMO via `kewisch/action-web-ext` sign command (listed channel)
- Release notes forwarded from GitHub release body
- Source code archive attached per AMO policy
- License **GPL-3.0-or-later** on AMO via `custom_license` metadata + full `LICENSE` text (`version.license` slug list has no `GPL-3.0-or-later`)
- Signed `.xpi` attached to GitHub release if available (listed extensions go through async review)

## Reference Implementation

The jekyll-mermaid-prebuild project at `/home/mobaxterm/Documents/git/jekyll-mermaid-prebuild` provides reference implementations for:
- release-please configuration (`release-please-config.json`, `.release-please-manifest.json`)
- Release workflow (`.github/workflows/release-please.yaml`)
- CI workflow (`.github/workflows/ci.yaml`)
- Lock file update workflow (`.github/workflows/update-gemfile-lock.yaml`)
- Dependabot (`.github/dependabot.yaml`)

## Operator Prerequisites

- Mozilla developer account with API credentials (key + secret)
- GitHub App for release-please bot tokens (same pattern as reference)
- Proper addon ID in `manifest.json` (replacing `tab-yeet@local.dev`)
