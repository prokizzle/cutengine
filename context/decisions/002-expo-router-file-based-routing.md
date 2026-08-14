# Decision: Expo Router File-Based Routing

## Context

The app has a tabbed main surface, a one-time onboarding flow that must not be escapable, and two modal screens for subscription purchase and management. Onboarding needs to be gated on whether a user profile exists, and that gate must resolve before any main-surface screen mounts.

## Decision

Expo Router with file-based routes and typed routes enabled.

Structure:

- A root stack layout with headers hidden, which owns third-party initialization.
- A tab group containing four screens: Today, Protocol, Meals, Settings.
- `/onboarding` as a stack screen with the back gesture disabled.
- `/paywall` and `/customer-center` as modal presentations.

The onboarding gate lives in the **tab group's layout, not the root layout**. It holds a three-state value — unknown, absent, present — rendering nothing while unknown, redirecting to onboarding when absent, and rendering the tabs when present.

Route files use default exports, which the router requires. Every other module in the codebase uses named exports.

## Rationale

Placing the gate in the tab layout rather than the root is the load-bearing detail, and the code documents why: tab screens call the profile getter, which inserts a default profile if none exists. If the gate ran in the root layout concurrently with tab screens mounting, the existence check would race the insertion it is meant to detect, and a first-time user could be silently given a default profile instead of being onboarded.

Rendering nothing during the unknown state, rather than defaulting to one branch, avoids a visible flash of the wrong surface.

Typed routes were enabled because navigation targets are string literals scattered across screens, and a renamed route should fail at type-check rather than at runtime.

Modal presentation for the paywall and customer center matches the fact that both are interruptions with a defined exit, not destinations.

## Alternatives Considered

- **Gate in the root layout.** Rejected for the race described above.
- **React Navigation configured by hand.** Would have given the same navigators without file-based routing or generated route types, and without Expo Router's default integration with the rest of the Expo tooling.
- **A conditional root render** (onboarding versus tabs chosen in the root component). Rejected in favour of a redirect, which keeps onboarding a real route with its own URL and gesture configuration.

## Outcomes

The gate fails open: if the existence check throws, the app assumes a profile exists and proceeds to the tabs. This is intentional and reasoned in the code — see [Anti-pattern: Onboarding Gate That Fails Closed](../knowledge/anti-patterns/onboarding-gate-that-fails-closed.md).

No screen under `app/` has a test. All test coverage is in components, utilities, hooks, and selectors.

## Related

- [Project Intent](../intent/project-intent.md)
- [Feature: Onboarding](../intent/feature-onboarding.md)
- [Feature: Subscription Access](../intent/feature-subscription-access.md)
- [Decision: Tech Stack](001-tech-stack.md)
- [Decision: Singleton Flat Phase Profile](007-singleton-flat-phase-profile.md)
- [Anti-pattern: Onboarding Gate That Fails Closed](../knowledge/anti-patterns/onboarding-gate-that-fails-closed.md)
- [Decision: RevenueCat Entitlement Gating](011-revenuecat-entitlement-gating.md)
- [Pattern: Actor-Serialized Upsert](../knowledge/patterns/actor-serialized-upsert.md)
- [Pattern: Component Folder Per Surface](../knowledge/patterns/component-folder-per-surface.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Accepted
- **Note**: Documented from existing implementation.
