# Decision: No Global State Store

## Context

The app has four tabs, a handful of modals, and a small amount of genuinely shared state: the user profile, HealthKit readings, subscription entitlement, and check-in history. All of it is local to the device and reachable from one native store or one SDK.

## Decision

No state management library, no React context for application state, and no server-state library. State lives in three places, chosen by what kind of state it is.

- **Custom hooks own each slice.** One hook per concern — profile, HealthKit, entitlement, paywall — each holding local state, exposing async mutators, and returning a flat object typed by a local result type.
- **Screens hold ephemeral UI state** with `useState`: which step of onboarding, whether a card is expanded, in-progress form values, which nudge was dismissed today.
- **Derived values are computed, never stored.** Inline or in a memo. Nothing that can be derived is kept in state.
- **`reselect` for expensive derivation** over collections, called directly with the data as its argument rather than through a store.

Mutators persist first, then set state — never the reverse. Every mutator early-returns when its underlying data is absent.

The only React provider in the tree is a safe-area inset override, which exists to keep content out from under the update banner. It is not an application-state install.

## Rationale

The state this app has does not need a store. There is no server, no cache invalidation, no optimistic update, and no cross-screen coordination beyond "read the profile." A store would add indirection between a screen and a native call that is already one function away.

Hooks as the slice boundary means each concern has one place where its loading, error, and mutation logic lives, and screens receive an already-shaped object. The uniform result-object shape makes them interchangeable to read.

Persist-then-set-state is the load-bearing detail. Setting state first would show the user a change that has not been saved, and a failed write would leave the UI displaying a value the store does not have. Persisting first means displayed state is state that survived a write. The cost is a slower-feeling interaction; the benefit is that the screen never lies.

Never storing derived values eliminates the entire class of bug where a cached derivation goes stale against its source.

Using reselect without a store looks unusual and is deliberate: the derivation over dose events is genuinely expensive enough to memoize, and reselect's single-entry reference-equality cache is exactly the right tool called directly. Adopting a store to get a selector library would be backwards.

## Alternatives Considered

- **Redux, Zustand, or Jotai.** Rejected: no state that needs coordination beyond a single hook, and no server state to cache.
- **React context for the profile.** Rejected: the profile hook is called by the screens that need it, and a context would add a provider and re-render coupling to solve nothing.
- **TanStack Query or SWR.** These solve server-state caching and revalidation. There is no server.
- **Setting state optimistically, then persisting.** Rejected per the argument above.

## Outcomes

The pattern has held across roughly seven screens without pressure to introduce a store.

One consequence is real: the profile hook is called independently by each screen that needs it, so several screens each hold their own copy of the profile and each reload it. Changing phase in Settings does not update another mounted screen's copy until that screen refreshes. This has not caused a visible bug because the tab screens reload on focus, but it is the seam where a store would eventually earn its place.

## Related

- [Project Intent](../intent/project-intent.md)
- [Decision: Tech Stack](001-tech-stack.md)
- [Decision: Singleton Flat Phase Profile](007-singleton-flat-phase-profile.md)
- [Pattern: Hook Owns a Slice and Persists Before Setting State](../knowledge/patterns/hook-persist-then-set-state.md)
- [Pattern: Selector Composition Chain](../knowledge/patterns/selector-composition-chain.md)
- [Pattern: Immutable Domain Mutators](../knowledge/patterns/immutable-domain-mutators.md)
- [Pattern: Controlled Component, Screen Owns State](../knowledge/patterns/controlled-component-screen-owns-state.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Accepted
- **Note**: Documented from existing implementation.
