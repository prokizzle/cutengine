# Pattern: Native Module Behind a lib Facade

## Description

Screens and hooks never import a native module directly. Each native module has a thin wrapper in `lib/` that owns the platform guard, the error policy, and the shape conversion. The wrapper obtains the native module through a `require` cast to a hand-written structural type, so type-checking does not depend on build-time native module resolution.

## When to Use

Every native capability. Add a `lib/` wrapper before the first consumer, not after the third.

## Pattern

- `require` the module's `src` entry point and cast it to an explicit object type listing the methods used, with a comment noting that resolution happens at build time rather than by the type-checker.
- Guard on platform at the top of every exported function; return a neutral value on other platforms.
- **Reads catch, report, and degrade.** **Writes propagate**, so callers can tell the user.
- Reshape native output into whatever the domain layer expects, so the shape conversion happens once rather than at each call site.

## Example

The typed handle, with the comment that explains why it is a `require` rather than an import:

```ts
// Local Expo Module — resolved at build time, not by tsc
const CycleStore = require("../modules/expo-cycle-store/src").default as {
  getUserProfile: () => Promise<UserProfile>;
  hasUserProfile: () => Promise<boolean>;
  saveUserProfile: (profile: UserProfile) => Promise<void>;
  getBiofeedbackEntries: () => Promise<BiofeedbackEntry[]>;
  saveBiofeedbackEntry: (entry: BiofeedbackEntry) => Promise<void>;
};
```

`lib/cycleStore.ts:8-15`

A read: platform guard, then catch, report, degrade.

```ts
export async function hasUserProfile(): Promise<boolean> {
  if (Platform.OS !== "ios") return true;
  try {
    return await CycleStore.hasUserProfile();
  } catch (err) {
    console.error("[CycleStore] hasUserProfile error:", err);
    Sentry.captureException(err);
    return true;
  }
}
```

`lib/cycleStore.ts:42-51`

The same handle shape in the HealthKit wrapper, which additionally reshapes native samples into the form the trend engine consumes:

```ts
const ExpoHealthKit = require("../modules/expo-healthkit/src").default as {
  requestAuthorization: (read: string[], write: string[]) => Promise<boolean>;
  getWeightSamples: (
    startDateISO: string,
  ) => Promise<{ dateISO: string; valueKg: number }[]>;
};
```

`lib/healthKit.ts:4`

## Files Using This Pattern

- `lib/cycleStore.ts` — wraps the profile and biofeedback slices of the cycle store; contains the deliberate fail-open on the profile existence probe
- `lib/healthKit.ts` — wraps the HealthKit bridge; memoizes authorization at module level and reshapes samples
- `lib/revenueCat.ts` — wraps the subscription SDK rather than a local native module, following the same facade shape; caches offerings at module level
- `lib/ota.ts` — wraps the updates SDK; returns a discriminated outcome instead of a boolean

The one exception: `app/(tabs)/protocol.tsx` imports the parser module directly rather than through a facade. There is no `lib/` wrapper for it.

## Related

- [Decision: Local Swift Expo Modules](../../decisions/004-local-swift-expo-modules.md)
- [Decision: HealthKit Is the Source of Truth for Body Measurements](../../decisions/006-healthkit-weight-source-of-truth.md)
- [Decision: SwiftData in a Shared App Group](../../decisions/005-swiftdata-app-group-persistence.md)
- [Decision: Sentry for Error Reporting](../../decisions/013-sentry-error-reporting.md)
- [Feature: Weight Tracking](../../intent/feature-weight-tracking.md)
- [Feature: Body Composition Input](../../intent/feature-body-composition-input.md)
- [Feature: Protocol Entry](../../intent/feature-protocol-entry.md)
- [Pattern: Capture Before Degrading](capture-before-degrading.md)
- [Pattern: Bridge Record Round Trip](bridge-record-round-trip.md)
- [Pattern: Discriminated Outcome Instead of a Boolean](discriminated-outcome-instead-of-boolean.md)
- [Anti-pattern: Eager Native Module Resolution](../anti-patterns/eager-native-module-resolution.md)
- [Decision: On-Device Token-Opaque Natural-Language Parsing](../../decisions/010-on-device-token-opaque-nl-parsing.md)
- [Anti-pattern: Onboarding Gate That Fails Closed](../anti-patterns/onboarding-gate-that-fails-closed.md)
- [Pattern: Hook Owns a Slice and Persists Before Setting State](hook-persist-then-set-state.md)

## Status

- **Created**: 2026-08-13
- **Status**: Active
