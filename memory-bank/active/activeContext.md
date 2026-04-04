# Active Context

- **Current Task**: M3 — AMO submission automation (`cicd-m3-amo`)
- **Phase**: PLAN - COMPLETE
- **What Was Done**: Level 2 plan written to `memory-bank/active/tasks.md`: TDD via `test/tooling/release-workflow-amo.test.js`, extend `release-please.yaml` with `git archive` source zip, `gh release view` for notes, `kewisch/action-web-ext` sign (listed), conditional signed XPI upload, README secrets; mitigations for shallow clone and async listed signing.
- **Next Step**: Preflight (`niko-preflight` skill), then build when PASS.
