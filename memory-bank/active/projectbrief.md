# Project Brief

## User Story

As a Tab Yeet user who shares batches of links into chat apps, I want additional clipboard formats and a place to find helper automation scripts so that I can paste URLs in the shape the destination expects and optionally drive desktop apps from the clipboard.

## Use-Case(s)

### Use-Case 1

Copy tabs as HTML or Markdown variants (plain URL lists, link lists, or wrapped HTML `<ul>` blocks).

### Use-Case 2

Open the options page and read or copy a Windows AutoHotkey v2 script that sends each clipboard line as a separate message; Linux and macOS show a placeholder until scripts exist.

## Requirements

1. Add copy formats: HTML anchor per line; Markdown `- url` per line; keep existing Markdown `- [title](url)`; HTML `<ul>` with `<li>url</li>` per line; HTML `<ul>` with `<li><a href="url">title</a></li>` per line.
2. Add an **Automation scripts** section below **Transform rules** with tabs Windows / Linux / macOS.
3. Windows tab: textarea with the provided AHK v2 script and a link to AutoHotkey v2 documentation.
4. Linux and macOS tabs: display **Coming soon...?**

## Constraints

1. Follow existing patterns: pure `lib/formats.js`, centralized storage in `lib/storage.js`, Vitest TDD.
2. No new runtime npm dependencies.

## Acceptance Criteria

1. Popup format dropdown lists all new formats with clear labels; copying uses the selected format after URL transforms.
2. Unit tests cover each new format and edge cases (empty list, unknown format fallback).
3. Options page shows automation tabs with Windows script and documentation link; other OS tabs show the placeholder.
