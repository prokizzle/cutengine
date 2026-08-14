# Pattern: Hook Owns a Slice and Persists Before Setting State

## Description

Each concern gets one custom hook. The hook holds the state, exposes async mutators, and returns a flat object typed by a local result type. Mutators **persist first and set state only after the write succeeds** — never the reverse.

## When to Use

Any state that outlives a single component or needs loading and error handling: the user profile, HealthKit readings, entitlement, the paywall.

Do not use for ephemeral UI state. Whether a card is expanded stays in the component.

## Pattern

- One hook per concern, named `use<Concern>`, returning an object typed by a local `Use<Concern>Result`.
- Load on mount in an effect whose promise terminates in a `.catch`.
- Every mutator is wrapped in `useCallback` and early-returns when its underlying data is absent.
- A single private `save` performs the write and then sets state; all mutators funnel through it.
- Mutators compose the pure domain transforms rather than editing state directly.
- Nothing derived is stored — derived values are computed by the consumer.

## Example

The persist-then-set core, and a mutator built on it:

```ts
const save = useCallback(async (next: UserProfile) => {
  await persistUserProfile(next);
  setProfile(next);
}, []);

const switchPhase = useCallback(
  async (phase: Phase, weeklyDeltaKg?: number) => {
    if (!profile) return;
    await save(updatePhase(profile, phase, { weeklyDeltaKg }));
  },
  [profile, save],
);
```
`hooks/useUserProfile.ts:35-46`

If the write throws, `setProfile` never runs, so the screen continues showing the last state that actually persisted rather than a value the store does not have.

A variation worth noting: the entitlement hook re-enters its loading state on **every** refresh, not only the first, so a screen returning from the paywall cannot act on a stale settled value.

```ts
// hooks/useProEntitlement.ts:18-25 — refresh() sets loading true again before checking
```

## Files Using This Pattern

- `hooks/useUserProfile.ts` — profile load, phase switch, weekly rate, macro overrides, refresh
- `hooks/useHealthKit.ts` — authorization, latest weight, history, the weight input field and its validation, and a history refresh after a successful write whose own errors are swallowed so they do not read as a failed save
- `hooks/useProEntitlement.ts` — entitlement with loading re-armed on every refresh
- `hooks/usePaywall.ts` — offerings, purchase, restore, and navigation on success

## Related

- [Decision: No Global State Store](../../decisions/015-no-global-state-store.md)
- [Decision: Singleton Flat Phase Profile](../../decisions/007-singleton-flat-phase-profile.md)
- [Decision: RevenueCat Entitlement Gating](../../decisions/011-revenuecat-entitlement-gating.md)
- [Feature: Phase Management](../../intent/feature-phase-management.md)
- [Feature: Weight Tracking](../../intent/feature-weight-tracking.md)
- [Pattern: Immutable Domain Mutators](immutable-domain-mutators.md)
- [Pattern: Native Module Behind a lib Facade](native-module-behind-lib-facade.md)
- [Pattern: Controlled Component, Screen Owns State](controlled-component-screen-owns-state.md)
- [Pattern: Selector Composition Chain](selector-composition-chain.md)

## Status

- **Created**: 2026-08-13
- **Status**: Active
