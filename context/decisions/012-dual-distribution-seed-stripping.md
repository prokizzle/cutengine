# Decision: Dual Distribution With Seed Stripping

## Context

The product's compound reference library — half-lives, default units, routes, and aliases for several dozen compounds — is what makes protocol tracking useful. It is also content that puts an App Store listing at risk.

The choice was between shipping one app without it, one app with it and accepting review risk, a fork, or one codebase producing two distributions.

## Decision

One codebase, three build profiles, and an inclusion-list mechanism that keeps the reference library out of everything except the sideload build.

**Profiles:**

| Profile | Channel | Distribution | Variant |
|---|---|---|---|
| production | production | store | production |
| internal | internal | internal (TestFlight) | production |
| sideload | sideload | internal | sideload |

Only the sideload profile sets the sideload variant. TestFlight deliberately runs the production variant, so the build under test is behaviourally identical to the submitted one.

**Variant gating.** A single environment variable drives one boolean in the app config, which selects app name, bundle identifier, and a runtime-readable flag. The two bundle identifiers differ, so both builds install side by side.

**The stripping mechanism.** A config plugin sets the asset bundle inclusion list to contain the seed file for the sideload variant, and to an **empty list** otherwise. Exclusion is expressed as absence from a positive inclusion list — never as a negated glob pattern.

**Three layers of verification:**

1. Continuous integration greps the plugin source: fails if a negated pattern appears, and requires the empty-list branch to still be present
2. A source scan before submission checks the working tree for banned terms, using word-boundary matching
3. A binary scan of the built app checks the compiled binary's strings and asserts the seed file is absent from the bundle

Build version numbers live on the build service rather than in the repository.

## Rationale

Two distributions rather than one is what lets both audiences be served: the App Store build reaches a general audience under rules it comfortably satisfies, and users who want the reference library install a build that was never submitted.

One codebase rather than a fork because a fork diverges within a release, and the divergence lands in the code both builds depend on.

The positive-inclusion-list choice is the most important detail here, and the reasoning is recorded in the plugin source and in `CLAUDE.md`. A negated pattern is a check that fails **open**: if the pattern stops matching — a renamed file, a changed directory, a tooling change in how globs are evaluated — the asset is included and nothing complains. An empty inclusion list fails **closed**: if it stops working, the failure is a missing asset in the sideload build, which is visible and harmless. The consequence of the open failure is losing an App Store listing, so the mechanism was chosen for its failure direction, not its expressiveness.

Three verification layers is proportionate to that consequence. Each catches what the previous misses: the CI check catches the configuration regressing, the source scan catches content added anywhere in the tree, and the binary scan inspects the artefact that actually ships rather than the configuration that was supposed to produce it. The innermost layer is the only one that would catch a build-tool bug.

Word-boundary matching in the scanners exists because the naive substring version produces false positives on ordinary English — the source records the specific collisions that motivated it — and a scanner that cries wolf gets bypassed.

TestFlight running the production variant means the beta build is the submission candidate. A TestFlight build that differed from the submitted build would make beta testing evidence about a different app.

## Alternatives Considered

- **One App Store app without the reference library.** Rejected: the feature would not exist for anyone.
- **One App Store app with it.** Rejected: unacceptable risk to the listing.
- **A separate fork for the sideload build.** Rejected: guaranteed divergence in shared code.
- **Negated glob patterns in the inclusion list.** Explicitly rejected, and now blocked by continuous integration. See [Anti-pattern: Negated Asset Bundle Patterns](../knowledge/anti-patterns/negated-asset-bundle-patterns.md).
- **A single verification layer.** Rejected as insufficient given the consequence of failure.

## Outcomes

The mechanism has held. The CI check is the layer that would catch the most likely regression — someone rewriting the plugin more expressively — and it exists precisely because that rewrite is tempting.

Two maintenance hazards are live:

- The plugin exists as both a TypeScript file and a hand-maintained CommonJS twin with identical logic. The config references it without an extension, so which one loads depends on resolution. **They must be kept in sync manually**, and continuous integration only inspects the TypeScript one.
- The two scanner scripts use *different* banned-term lists. The binary scanner drops several terms the source scanner checks and adds several the source scanner does not. Whether that divergence is intentional is not recorded.

App Store metadata under `metadata/` is versioned by release number and currently contains only a 1.0.1 directory, while the app declares version 2.0.0.

## Related

- [Project Intent](../intent/project-intent.md)
- [Feature: Dual Distribution](../intent/feature-dual-distribution.md)
- [Feature: Protocol Entry](../intent/feature-protocol-entry.md)
- [Feature: App Updates](../intent/feature-app-updates.md)
- [Decision: Tech Stack](001-tech-stack.md)
- [Decision: Over-the-Air Updates With Fingerprint Runtime Versioning](014-expo-updates-ota.md)
- [Decision: Colocated Tests and Type-Check CI](016-colocated-tests-and-ci.md)
- [Decision: Linear Release Automation](018-linear-release-automation.md)
- [Pattern: Variant-Gated Config Plugin](../knowledge/patterns/variant-gated-config-plugin.md)
- [Pattern: Defense in Depth on One Invariant](../knowledge/patterns/defense-in-depth-on-one-invariant.md)
- [Anti-pattern: Negated Asset Bundle Patterns](../knowledge/anti-patterns/negated-asset-bundle-patterns.md)
- [Decision: On-Device Token-Opaque Natural-Language Parsing](010-on-device-token-opaque-nl-parsing.md)
- [Decision: Sentry for Error Reporting](013-sentry-error-reporting.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Accepted
- **Note**: Documented from existing implementation.
