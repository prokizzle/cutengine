# Decision: Over-the-Air Updates With Fingerprint Runtime Versioning

## Context

The product ships two distributions and iterates quickly. App Store review sits between a fix and its users, and the sideload distribution has no store update path at all. Most of what needs fixing is JavaScript.

## Decision

`expo-updates`, with a fingerprint runtime-version policy and a channel per build profile.

- Runtime version is derived from a fingerprint of the native build rather than a hand-maintained version string
- Each build profile publishes to its own channel: production, internal, sideload
- A background check runs once at launch, fire and forget
- A banner appears when an update has been downloaded and is pending; tapping it reloads onto the new version
- Manual check available from Settings
- The check returns a **discriminated outcome** — disabled, up to date, staged, already pending, or error — rather than a boolean
- Channel and a truncated update identifier are displayed in Settings
- Check failures are reported to the error reporter

## Rationale

The fingerprint policy is what makes over-the-air updates safe here. A JavaScript bundle that assumes a native module the installed binary does not have will crash on launch. Deriving the runtime version from the native build means such a bundle is simply not offered to that binary — the incompatibility is prevented at delivery rather than detected at runtime. A hand-maintained version string relies on someone remembering to increment it in exactly the commit that changed a native module, which is a discipline that fails eventually and fails as a crash loop.

Separate channels per profile means a sideload update cannot land on an App Store build. Given that the two builds differ in bundled content, cross-delivery would be a correctness problem, not just a versioning one.

The discriminated outcome is the detail worth preserving. Five states collapsed into a boolean loses the two that matter most: "already pending" and "the check failed" both look like "no update" to a user, and the second one silently strands them on a broken version believing they are current. Every state gets its own message in Settings.

Surfacing channel and update identifier is for support. The first thing to establish when a user reports impossible behaviour is which bundle they are actually running.

## Alternatives Considered

- **App Store updates only.** Rejected: review latency on JavaScript-only fixes, and no path at all for the sideload distribution.
- **A hand-maintained runtime version string.** Rejected per the crash-loop failure mode.
- **A single shared channel.** Rejected: would allow cross-delivery between distributions that differ in bundled content.
- **Returning a boolean from the check.** Rejected per the argument above; this is the origin of the discriminated-outcome pattern used elsewhere in the codebase.
- **Forcing an immediate reload when an update is ready.** Rejected in favour of a banner the user taps — a forced restart mid-task loses whatever they were doing.

## Outcomes

The discriminated-outcome shape proved general enough to be worth reusing; it is documented as a pattern.

The banner takes over the top safe-area inset while visible, and the root layout zeroes that inset for descendants so nothing renders underneath it.

## Related

- [Project Intent](../intent/project-intent.md)
- [Feature: App Updates](../intent/feature-app-updates.md)
- [Feature: Dual Distribution](../intent/feature-dual-distribution.md)
- [Decision: Tech Stack](001-tech-stack.md)
- [Decision: Dual Distribution With Seed Stripping](012-dual-distribution-seed-stripping.md)
- [Decision: Sentry for Error Reporting](013-sentry-error-reporting.md)
- [Pattern: Discriminated Outcome Instead of a Boolean](../knowledge/patterns/discriminated-outcome-instead-of-boolean.md)
- [Pattern: Capture Before Degrading](../knowledge/patterns/capture-before-degrading.md)
- [Pattern: Self-Suppressing Card Component](../knowledge/patterns/self-suppressing-card-component.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Accepted
- **Note**: Documented from existing implementation.
