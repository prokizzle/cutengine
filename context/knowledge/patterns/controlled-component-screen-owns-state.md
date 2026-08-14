# Pattern: Controlled Component, Screen Owns State

## Description

Components that participate in persisted state are fully controlled: they take current values and change callbacks, and hold no internal copy. Only genuinely ephemeral interaction state — whether a card is expanded, an in-progress form value not yet submitted — lives inside a component.

## When to Use

Any component whose value ends up persisted or shared. The test: if the value must survive the component unmounting, the screen or a hook owns it.

## Pattern

- Props carry the current value plus a change callback plus the action callback.
- No `useState` mirroring a prop, and no effect synchronizing them.
- Where a sub-component legitimately holds in-progress state, reset it by remounting with a `key` rather than syncing with an effect.
- Optional callbacks are marked optional and their trigger is conditionally rendered, so an unused affordance does not appear.
- `number | null` for "absent but known"; `?` for genuinely optional.

## Example

A fully controlled widget — every value comes from the screen, nothing is held locally:

```ts
// components/today/HealthKitWidget.tsx
type Props = {
  ready: boolean;
  weightKg: number | null;
  weightInput: string;
  onWeightInputChange: (v: string) => void;
  onLogWeight: () => void;
};
```

The screen holds `weightInput` because the weight hook owns it, which is what lets a successful write clear the field and refresh history in one place.

Where in-progress state is legitimate, it is reset by remounting rather than by an effect:

```tsx
// components/settings/PhaseSettings.tsx:222
<MacroSplitEditor key={phase} … />
```

Changing phase gives the editor a new identity, so its half-typed macro fields are discarded rather than carried across to a different phase's split.

An optional callback gates its own affordance:

```tsx
{onDismiss && (<TouchableOpacity … />)}
```

## Files Using This Pattern

- `components/today/HealthKitWidget.tsx` — fully controlled; no internal state at all
- `components/settings/PhaseSettings.tsx` — controlled on the profile, with a remount-keyed editor for in-progress macro fields
- `components/today/CheckInCard.tsx` — holds only expansion state and unsubmitted scores; the submitted answers go up through a callback
- `components/paywall/PackageCard.tsx` — controlled on disabled state, action via callback
- `hooks/useHealthKit.ts` — owns the weight input value and its validation on behalf of the widget

## Related

- [Decision: No Global State Store](../../decisions/015-no-global-state-store.md)
- [Feature: Weight Tracking](../../intent/feature-weight-tracking.md)
- [Feature: Phase Management](../../intent/feature-phase-management.md)
- [Feature: Daily Check-In](../../intent/feature-daily-check-in.md)
- [Pattern: Hook Owns a Slice and Persists Before Setting State](hook-persist-then-set-state.md)
- [Pattern: Component Folder Per Surface](component-folder-per-surface.md)

## Status

- **Created**: 2026-08-13
- **Status**: Active
