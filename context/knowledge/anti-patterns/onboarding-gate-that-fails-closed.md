# Anti-pattern: Onboarding Gate That Fails Closed

## What Not To Do

Do not treat a failed profile-existence check as "no profile exists":

```ts
// WRONG — do not do this
try {
  return await CycleStore.hasUserProfile();
} catch {
  return false;   // sends the user into onboarding
}
```

Return `true` and let them into the app:

```ts
// RIGHT
} catch (err) {
  console.error("[CycleStore] hasUserProfile error:", err);
  Sentry.captureException(err);
  return true;
}
```
`lib/cycleStore.ts:42-51`

## What Breaks

Two things, in sequence.

First, the user is routed into onboarding. Onboarding reads the store too, so it hits the same underlying failure — the user is now in a loop they cannot leave, because the back gesture is deliberately disabled during onboarding.

Second, and worse: if they do manage to complete onboarding, it writes a fresh profile at the singleton identifier. That **overwrites the existing profile** — their phase, their start date, their macro overrides — with defaults. A transient read failure becomes permanent data loss.

Failing open has the opposite profile. A user with no profile who is wrongly let into the app hits a tab screen, which calls the profile getter, which inserts the default profile. They end up on a cut at the default rate rather than in onboarding: wrong, but not destructive, and correctable from Settings.

## How It Was Caught

The reasoning is committed as a comment at the call site rather than left to be rediscovered, and the same fail-open logic is applied to the entitlement check for the same asymmetry reason — a paying user locked out by a transient error churns, while a non-paying user briefly seeing a paid phase costs nothing.

Note that failing open is only defensible because the error is still captured. Fail-open without reporting would mean a persistent store failure that silently gives every new user a default profile, forever, with no signal. See [Pattern: Capture Before Degrading](../patterns/capture-before-degrading.md).

## Why Someone Would Do It Anyway

`return false` is the instinct. The check is named "has a profile," an error means the answer is unknown, and defaulting an unknown boolean to false feels conservative and safe. In most systems it would be.

It is wrong here because of a coupling that is not visible at the catch site: the profile getter inserts on first read, and completing onboarding overwrites at a fixed identifier. Both are documented in [Decision: Singleton Flat Phase Profile](../../decisions/007-singleton-flat-phase-profile.md), and the second is what turns a conservative default into data loss.

The same coupling is why the gate lives in the tab-group layout rather than the root layout — see [Decision: Expo Router File-Based Routing](../../decisions/002-expo-router-file-based-routing.md).

## Related

- [Decision: Singleton Flat Phase Profile](../../decisions/007-singleton-flat-phase-profile.md)
- [Decision: Expo Router File-Based Routing](../../decisions/002-expo-router-file-based-routing.md)
- [Decision: Sentry for Error Reporting](../../decisions/013-sentry-error-reporting.md)
- [Decision: RevenueCat Entitlement Gating](../../decisions/011-revenuecat-entitlement-gating.md)
- [Feature: Onboarding](../../intent/feature-onboarding.md)
- [Pattern: Capture Before Degrading](../patterns/capture-before-degrading.md)
- [Pattern: Native Module Behind a lib Facade](../patterns/native-module-behind-lib-facade.md)

## Status

- **Created**: 2026-08-13
- **Status**: Active
