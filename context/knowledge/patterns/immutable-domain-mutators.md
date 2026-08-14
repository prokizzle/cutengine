# Pattern: Immutable Domain Mutators

## Description

Functions that change a domain object return a new object. Nothing is mutated in place, on either side of the bridge. The TypeScript helpers spread copies; the Swift value types are structs.

## When to Use

Every transformation of a domain type — the user profile above all, since it is read by many screens and written from two.

## Pattern

- Take the object as the first argument, return a new object of the same type.
- Spread, then override the changed fields.
- For nested collections, copy the collection before modifying it.
- Deleting a key is an explicit branch, not an assignment of `undefined`.
- Injectable time via an options argument where a transform stamps a date.

## Example

Removing an override versus setting one, on a copied collection:

```ts
export function setMacroOverride(profile: UserProfile, phase: Phase, ratio: MacroRatio | null): UserProfile {
  const macroOverrides = { ...profile.macroOverrides };
  if (ratio == null) delete macroOverrides[phase];
  else macroOverrides[phase] = ratio;
  return { ...profile, macroOverrides };
}
```
`modules/expo-cycle-store/src/userProfile.ts:61`

Reads also return copies, so a caller cannot accidentally hold a reference into the profile and mutate it:

```ts
// macroRatioFor returns { ...(profile.macroOverrides[phase] ?? DEFAULT_MACROS[phase]) }
```
`modules/expo-cycle-store/src/userProfile.ts:38`

The hook layer composes these rather than editing state in place:

```ts
const switchPhase = useCallback(
  async (phase: Phase, weeklyDeltaKg?: number) => {
    if (!profile) return;
    await save(updatePhase(profile, phase, { weeklyDeltaKg }));
  },
  [profile, save],
);
```
`hooks/useUserProfile.ts:41-46`

## Files Using This Pattern

- `modules/expo-cycle-store/src/userProfile.ts` — `macroRatioFor`, `updatePhase`, `setMacroOverride`
- `hooks/useUserProfile.ts` — composes the pure transforms and persists the result
- `components/settings/PhaseSettings.tsx` — passes new ratio objects up rather than editing the profile
- `modules/expo-cycle-store/ios/Sources/Types/` — Swift domain types are structs, so the same semantics hold natively

## Related

- [Decision: Singleton Flat Phase Profile](../../decisions/007-singleton-flat-phase-profile.md)
- [Decision: No Global State Store](../../decisions/015-no-global-state-store.md)
- [Decision: SwiftData in a Shared App Group](../../decisions/005-swiftdata-app-group-persistence.md)
- [Feature: Phase Management](../../intent/feature-phase-management.md)
- [Pattern: Hook Owns a Slice and Persists Before Setting State](hook-persist-then-set-state.md)
- [Pattern: Actor-Serialized Upsert](actor-serialized-upsert.md)

## Status

- **Created**: 2026-08-13
- **Status**: Active
