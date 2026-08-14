# Decision: Sentry for Error Reporting

## Context

The app ships over the air to two distributions, one of which is sideloaded and therefore has no App Store crash reporting at all. Errors that occur in a user's kitchen at seven in the morning need to reach the developer.

## Decision

Sentry, initialized at module scope in the root layout before any component renders, with explicit capture at every point where an error is deliberately swallowed.

- Initialized from an environment variable at module scope, not in an effect, so failures during early initialization are still captured
- Debug mode follows the development flag; traces are sampled at full rate
- The Sentry Expo config plugin handles source-map upload at build time
- Sourcemap upload is allowed to fail without failing the build, via a build environment flag
- The SDK version is pinned outside Expo's dependency management, so an Expo upgrade cannot move it
- **Every deliberate error swallow reports.** Where a read failure degrades to a neutral value, the error is captured before the degradation
- Fire-and-forget promises terminate in a capture or a console error rather than an unhandled rejection

## Rationale

Module-scope initialization rather than an effect is the substantive choice. Initialization inside an effect runs after the first render, which means any error thrown during that first render — the exact class of error most likely to make the app unusable — happens before the reporter exists.

Capturing at every deliberate swallow is what makes the degradation strategy defensible. This codebase intentionally fails open in several places: a failed profile-existence check assumes the profile exists, a failed entitlement check assumes access is granted, a failed read returns an empty list. Each of those is the right user-facing behaviour and each hides a real fault. Capturing before degrading is what keeps "fail open" from meaning "fail silently forever."

Allowing sourcemap upload to fail soft in continuous integration is a pragmatic trade: unreadable stack traces on one build is a worse-diagnostics problem, while a failed build over a symbol-upload hiccup blocks a release.

Pinning the SDK outside Expo's dependency resolution means the reporting layer changes deliberately.

## Alternatives Considered

- **App Store Connect crash reporting alone.** Insufficient: it does not cover the sideload distribution, and it does not capture handled errors, which is where this codebase's deliberate degradations live.
- **Console logging only.** Rejected: unreachable on a user's device.
- **Initializing inside an effect.** Rejected per the first-render gap.
- **Failing the build on sourcemap upload errors.** Rejected as too brittle for the value.

## Outcomes

The capture-before-degrade convention is applied consistently in the store and update wrappers. The RevenueCat wrapper is the exception: its entitlement check swallows to false with no capture, so a persistent entitlement failure would be invisible in reporting while quietly granting access. That is worth aligning.

## Related

- [Project Intent](../intent/project-intent.md)
- [Feature: App Updates](../intent/feature-app-updates.md)
- [Decision: Tech Stack](001-tech-stack.md)
- [Decision: Over-the-Air Updates With Fingerprint Runtime Versioning](014-expo-updates-ota.md)
- [Decision: Dual Distribution With Seed Stripping](012-dual-distribution-seed-stripping.md)
- [Pattern: Capture Before Degrading](../knowledge/patterns/capture-before-degrading.md)
- [Anti-pattern: Onboarding Gate That Fails Closed](../knowledge/anti-patterns/onboarding-gate-that-fails-closed.md)
- [Pattern: Native Module Behind a lib Facade](../knowledge/patterns/native-module-behind-lib-facade.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Accepted
- **Note**: Documented from existing implementation.
