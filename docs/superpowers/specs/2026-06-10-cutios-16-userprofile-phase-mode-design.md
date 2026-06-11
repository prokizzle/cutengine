# CUTIOS-16 — Phase mode on v2 UserProfile

**Date:** 2026-06-10
**Linear:** CUTIOS-16
**Project:** CutEngine v2 — Expo Rewrite
**Status:** Spec approved, implementation deferred

## Context

v1 spec was written for the SwiftData/Swift architecture (separate `UserProfile` SwiftData entity, in-app schema migration). v1 is frozen per CUTIOS-121. v2 runs on Expo SDK 56 with TypeScript and Expo Modules — native Swift code lives inside the modules, but the application layer is TS.

This document specifies the v2 redesign for adding phase mode (cut / bulk / maintenance) to a `UserProfile`. Acceptance criteria below are mirrored into the Linear issue.

## Architecture & boundaries

`UserProfile` is a singleton entity living in `modules/expo-cycle-store`.

- Same App Group (`group.com.feelingmindful.shared`) as the rest of CycleStore → CardioEngine can read phase mode without a separate wire-up.
- HealthKit remains the source of truth for `bodyMass`. UserProfile holds only fields that do not belong in HealthKit: phase, macro overrides, weekly weight-delta target.
- The Swift actor isolation in `CycleStore` already serializes reads/writes against existing operations; no new locking required.

Surface added:

- `modules/expo-cycle-store/ios/Sources/Models.swift` — `UserProfileEntity` (SwiftData `@Model`)
- `modules/expo-cycle-store/ios/Sources/Types/UserProfile.swift` — `UserProfile: Sendable, Codable` value type
- `modules/expo-cycle-store/ios/Sources/CycleStore.swift` — actor methods `userProfile()` / `saveUserProfile(_:)`
- `modules/expo-cycle-store/src/index.ts` — JS exports `getUserProfile()` / `saveUserProfile(profile)`
- TS bridge helpers (pure functions in `src/index.ts`): `updatePhase`, `setMacroOverride`, `macroRatioFor`

## Data shape

```ts
type Phase = "cut" | "bulk" | "maintenance";

interface MacroRatio {
  protein: number; // 0..1
  carb: number;    // 0..1
  fat: number;     // 0..1
}

interface UserProfile {
  id: string;                                          // fixed singleton ID "user-profile-singleton"
  currentPhase: Phase;
  phaseStartDate: string;                              // ISO 8601
  macroOverrides: Partial<Record<Phase, MacroRatio>>;  // present = override, absent = use default
  targetWeightDeltaPerWeekKg: number;                  // signed; negative = cut, positive = bulk, ~0 = maintenance
}
```

Default macros (built into the module, not stored):

| Phase       | Protein | Carb | Fat  |
|-------------|---------|------|------|
| cut         | 0.40    | 0.30 | 0.30 |
| bulk        | 0.30    | 0.45 | 0.25 |
| maintenance | 0.30    | 0.40 | 0.30 |

`macroRatioFor(profile, phase)` returns the override if present in `macroOverrides[phase]`, otherwise the default. Helper lives in TS.

## Initialization, defaults, migration

- On first `getUserProfile()` call when the row is absent, the actor inserts the default singleton and returns it:

  ```
  {
    id: "user-profile-singleton",
    currentPhase: "cut",
    phaseStartDate: <now ISO>,
    macroOverrides: {},
    targetWeightDeltaPerWeekKg: -0.5
  }
  ```

  `-0.5` kg/week ≈ 1 lb/week cut default.

- No v1 migration code. v1 frozen per CUTIOS-121.
- SwiftData schema: this is the first new entity since the original schema — additive. Only change is adding `UserProfileEntity.self` to the `Schema([...])` array in `CycleStore.initialize`. No `VersionedSchema`, no migration policy.

## Validation & error handling

`saveUserProfile` validates:

- Every ratio field is finite (`isFinite` true).
- For each phase present in `macroOverrides`, `protein + carb + fat` ∈ `[0.99, 1.01]` (allow rounding noise).
- `targetWeightDeltaPerWeekKg` ∈ `[-1.5, 1.5]` kg (sanity bound).

Out-of-range input throws `StoreError.invalidUserProfile(reason:)`. The bridge layer surfaces typed errors via the existing `ExpoBridgeRecords` pattern.

`getUserProfile()` always returns a `UserProfile` — creates the default singleton if missing rather than returning `nil`. Eliminates a nullable branch at every consumer.

## Testing

Add to `modules/expo-cycle-store/ios/Tests/CycleStoreTests.swift`:

1. First fetch creates the default singleton (cut, `-0.5` kg/week, no overrides).
2. Round-trip save → fetch returns the equal struct.
3. Saving a second profile mutates the same singleton — no duplicate rows.
4. `macroRatioFor` returns the default when the override is absent and the override when present.
5. Invalid ratio sum (e.g. 0.4 / 0.4 / 0.4 = 1.2) throws `invalidUserProfile`.
6. Invalid `targetWeightDeltaPerWeekKg` (e.g. 10) throws `invalidUserProfile`.
7. CardioEngine-shaped test: a second `CycleStore` instance against the same in-memory container observes the saved profile.

Target coverage ≥ 80% on new code.

## Acceptance criteria

1. `modules/expo-cycle-store/src/index.ts` exports `Phase`, `MacroRatio`, `UserProfile` types matching the **Data shape** section verbatim.
2. `getUserProfile()` returns a `UserProfile`; if no singleton exists, creates and returns the default specified in **Initialization**.
3. `saveUserProfile(profile)` persists into the same App Group container; a subsequent `getUserProfile()` returns the saved value.
4. `macroRatioFor(profile, phase)` returns the override if present in `macroOverrides[phase]`, else the built-in default from **Data shape**.
5. Invalid input throws `StoreError.invalidUserProfile(reason:)` for: non-finite ratios, ratio sum outside `[0.99, 1.01]`, `targetWeightDeltaPerWeekKg` outside `[-1.5, 1.5]`.
6. Unit tests listed in **Testing** all pass; coverage ≥ 80% for new code.
7. No v1 migration code; no SwiftData schema version bump beyond adding `UserProfileEntity` to the existing `Schema` array.

## Out of scope (separate Linear issues)

- Phase history / transition log
- Atomic native mutators (`setPhase`, `setMacroOverride`, `setWeeklyDeltaKg`)
- JS event emitter / cross-app reactive subscription
- CalorieEngine-driven macro derivation
- UI consumers — phase toggle (CUTIOS-17), dashboard cards (CUTIOS-19), onboarding (CUTIOS-23)
- The `expo-calorie-engine` module itself (not yet built)

## Decision log

| Decision | Choice | Why |
|----------|--------|-----|
| Storage location | Extend `expo-cycle-store` | Existing pattern; same App Group → CardioEngine reads phase; single persistence layer |
| Phase model | Flat (`currentPhase` + `phaseStartDate`) | YAGNI; history can be derived from cycle/weight data later |
| Macro split | Per-phase defaults + per-phase overrides | Sensible defaults reduce onboarding friction; overrides preserve power-user control |
| Surplus target | Signed `targetWeightDeltaPerWeekKg` | One field, all phases; aligns with HealthKit kg-internal model |
| Default phase | `cut`, `phaseStartDate = now` (set when the singleton is first inserted on initial `getUserProfile()`) | Greenfield; v1 frozen; HealthKit weight history carries over |
| JS/Native API | Replace-all (`get` + `save`); no native mutators | Matches existing CycleStore pattern verbatim; YAGNI on mutators; TS helpers cover intent at call sites |
