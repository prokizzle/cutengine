# Pattern: Capture Before Degrading

## Description

Where an error is deliberately swallowed so the user experience continues, the error is reported to the error reporter first. "Fail open" never means "fail silently."

The corollary: writes do not swallow. A failed write propagates so the caller can tell the user and let them retry.

## When to Use

Every catch block that returns a fallback value instead of rethrowing.

## Pattern

- Catch, log to console with a bracketed module tag, capture to Sentry, then return the neutral value.
- Comment the *reason* for the fallback direction when it is not obvious — particularly when failing open has user-visible consequences.
- Fire-and-forget promises end in `.catch` that captures, never bare.

## Example

The full shape, with the deliberate fail-open direction:

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

The reasoning for returning `true` — rather than `false` — is recorded in the source: routing a user into onboarding on a transient read failure would hit the same error again, and completing onboarding would overwrite a profile that already exists.

A write, by contrast, does not catch. The screen does, and tells the user:

```ts
const finish = async (selectedPhase: Phase, deltaKg: number) => {
  try {
    await persistUserProfile({ /* … */ });
    router.replace("/(tabs)");
  } catch (err) {
    console.error("[Onboarding] failed to save profile:", err);
    Alert.alert("Couldn't save your setup", "Please try again.");
  }
};
```
`app/onboarding.tsx:70-84`

Fire-and-forget work still reports:

```ts
// checkAndFetchUpdate() at launch — .catch((err) => Sentry.captureException(err))
```
`app/_layout.tsx`

## Files Using This Pattern

- `lib/cycleStore.ts` — every read catches, reports, and degrades; writes propagate
- `lib/ota.ts` — check failures report and return an `error` outcome rather than a false "up to date"
- `app/_layout.tsx` — launch update check terminates in a capture
- `app/(tabs)/_layout.tsx` — the onboarding gate logs and fails open
- `app/onboarding.tsx`, `app/(tabs)/index.tsx`, `hooks/useHealthKit.ts` — write failures surface to the user as an alert

Known gap: `lib/revenueCat.ts` swallows entitlement-check failures to `false` with no capture, so a persistent failure would be invisible in reporting.

## Related

- [Decision: Sentry for Error Reporting](../../decisions/013-sentry-error-reporting.md)
- [Decision: RevenueCat Entitlement Gating](../../decisions/011-revenuecat-entitlement-gating.md)
- [Decision: Over-the-Air Updates With Fingerprint Runtime Versioning](../../decisions/014-expo-updates-ota.md)
- [Feature: App Updates](../../intent/feature-app-updates.md)
- [Pattern: Native Module Behind a lib Facade](native-module-behind-lib-facade.md)
- [Pattern: Discriminated Outcome Instead of a Boolean](discriminated-outcome-instead-of-boolean.md)
- [Anti-pattern: Onboarding Gate That Fails Closed](../anti-patterns/onboarding-gate-that-fails-closed.md)
- [Anti-pattern: Eager Native Module Resolution](../anti-patterns/eager-native-module-resolution.md)

## Status

- **Created**: 2026-08-13
- **Status**: Active
