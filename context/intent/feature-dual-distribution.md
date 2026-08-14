# Feature: Dual Distribution

## What

One codebase ships as two separate apps.

The App Store build is called CutEngine and contains the phase, target, check-in, and trend features described elsewhere in this document set.

The sideloaded build is called CutEngine Pro, carries a different bundle identifier, is distributed outside the App Store through sideloading tools, and additionally bundles a reference library of compounds with their half-lives, default units, routes, and aliases.

The two builds are installable side by side. Which build is running is readable at runtime.

Three independent checks enforce that the reference library never reaches an App Store build: a check on the packaging configuration in continuous integration, a scan of the source tree before submission, and a scan of the compiled binary itself.

## Why

The reference library is the part of the product that makes protocol tracking genuinely useful, and it is also the part that puts an App Store listing at risk. Shipping one app that contains it means risking the listing that reaches most users; shipping one app without it means the feature does not exist.

Two distributions resolve that: the App Store build reaches a general audience under review rules it comfortably satisfies, and users who want the reference library install a build that was never submitted for review.

Maintaining them as one codebase rather than a fork is what keeps this sustainable — a fork would diverge within a release, and the divergence would be in exactly the code both builds depend on.

Three layers of verification rather than one is a considered response to the failure mode. A single check that stops working produces a silent, non-obvious failure whose consequence is losing the App Store listing. Each layer catches what the previous one would miss, and the innermost one inspects the artefact that actually ships rather than the configuration that was supposed to produce it.

## Acceptance Criteria

- [x] Two distinct bundle identifiers, installable side by side
- [x] Distinct app names per distribution
- [x] Which build is running is readable at runtime
- [x] The sideload build bundles the compound reference library
- [x] App Store and TestFlight builds do not bundle the reference library
- [x] The packaging configuration is verified in continuous integration
- [x] The source tree is scanned before submission
- [x] The compiled binary is scanned before submission
- [x] The binary scan confirms the reference library file is absent from the bundle
- [x] Exclusion is expressed as an empty inclusion list, never as a negated pattern
- [x] Each distribution builds from a single documented command

## Related

- [Project Intent](project-intent.md)
- [Feature: Protocol Entry](feature-protocol-entry.md)
- [Feature: App Updates](feature-app-updates.md)
- [Decision: Dual Distribution With Seed Stripping](../decisions/012-dual-distribution-seed-stripping.md)
- [Decision: Colocated Tests and Type-Check CI](../decisions/016-colocated-tests-and-ci.md)
- [Pattern: Variant-Gated Config Plugin](../knowledge/patterns/variant-gated-config-plugin.md)
- [Anti-pattern: Negated Asset Bundle Patterns](../knowledge/anti-patterns/negated-asset-bundle-patterns.md)
- [Decision: Over-the-Air Updates With Fingerprint Runtime Versioning](../decisions/014-expo-updates-ota.md)
- [Decision: Linear Release Automation](../decisions/018-linear-release-automation.md)
- [Pattern: Defense in Depth on One Invariant](../knowledge/patterns/defense-in-depth-on-one-invariant.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Active (already implemented)
