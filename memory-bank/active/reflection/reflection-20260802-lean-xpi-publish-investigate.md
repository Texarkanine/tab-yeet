---
task_id: 20260802-lean-xpi-publish-investigate
date: 2026-08-02
complexity_level: 2
---

# Reflection: Lean Firefox XPI + investigate store publish failures

## Summary

Firefox XPIs no longer pack `screenshots/`/`docs/` (contract-tested). AMO `unsupported_filetype` was traced to web-ext 8 `FileBlob` under Node 24 and fixed by moving to `kewisch/action-web-ext@v2`; CWS `invalid_grant` is credentials and documented for operator rotation.

## Requirements vs Outcome

Delivered both packaging hygiene and publish investigation. In-repo AMO fix is the upstream action bump (operator-led mid-build). CWS has no code fix — troubleshooting docs updated. No scope creep.

## Plan Accuracy

Plan correctly separated bloat from AMO failure. The Node 20 opt-out path was a reasonable hypothesis but superseded by the better v2 move; abandoning that contract test was the right call. Built-XPI listing tests were the load-bearing packaging contract.

## Build & QA Observations

Packaging TDD was smooth. AMO root-cause needed a Node 24 FormData repro against web-ext’s own error comment. QA found nothing substantive.

## Insights

### Technical
- web-ext’s own submit-addon comment documents AMO `unsupported_filetype` when the multipart upload lacks a `.xpi`/`.zip` filename — Node 24 made the FileBlob hack lose that name (`blob`). Prefer actions that already use native `File` / web-ext 10+.
- Store-asset bloat can coexist with successful AMO history; size alone does not explain filetype validation errors.

### Process
- When the operator already has the durable fix (upstream bump), drop the temporary workaround rather than testing both paths.

### Million-Dollar Question

Firefox packaging that allowlists runtime dirs the way Chrome staging does would make “don’t ship screenshots” structural rather than ignore-list maintenance — but ignore pairs are adequate at this scale and match existing coverage hygiene.
