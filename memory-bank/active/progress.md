# Progress: M3 — AMO submission automation

Extend the release workflow so that on GitHub Release creation the extension is submitted to addons.mozilla.org via `kewisch/action-web-ext` (listed channel), with source archive, GPLv3 license metadata, release notes from the GitHub release body, and signed `.xpi` attached when AMO returns it.

**Complexity:** Level 2

## Phase History

- **COMPLEXITY-ANALYSIS**: Complete. M3 classified Level 2: CI/CD enhancement extending the existing release-please flow; touches workflows, optional repo docs, and external AMO/GitHub secrets—same class as M2, not a multi-subsystem redesign.
