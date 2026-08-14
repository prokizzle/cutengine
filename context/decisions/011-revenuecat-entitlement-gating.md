# Decision: RevenueCat Entitlement Gating

## Context

Two of the three phases are paid. The app needed subscription purchase, restore, cross-device entitlement, and subscription management, on iOS, without building receipt validation infrastructure.

## Decision

RevenueCat, with a single named entitlement gating phase selection.

- One entitlement identifier controls all paid capability
- Anonymous app user identifiers — no account system, no login
- Offerings are fetched once and cached at module level
- Entitlement is checked on demand, not held in a long-lived cache
- The custom paywall composes RevenueCat's package list into the app's own visual language
- Subscription management uses RevenueCat's native customer-center view rather than a hand-built screen
- Purchase cancellation is distinguished from purchase failure and surfaced as neither error nor message
- Entitlement-check failure fails open: a failed check does not lock the user out, and the paywall still loads its offerings
- The entitlement hook re-enters its loading state on every refresh, not only the first, so callers cannot act on a stale value mid-check

## Rationale

RevenueCat over StoreKit directly because receipt validation, subscription-state edge cases, and cross-device entitlement are a large amount of work with a long tail of correctness bugs, none of which is this product's problem to solve.

Anonymous identifiers because the app has no accounts and does not want them. Entitlement follows the App Store account, which is what users expect and what makes restore work without a login.

Failing open on an entitlement-check error is the important call. The failure modes are asymmetric: a paying user locked out by a transient network error will churn, while a non-paying user briefly seeing a paid phase costs essentially nothing and self-corrects on the next check. The same reasoning appears in the profile-existence gate.

Re-entering the loading state on every refresh addresses a specific bug shape. The paywall is reached from onboarding, and onboarding re-checks entitlement when it regains focus. If the hook only signalled loading on first mount, the returning screen would briefly report the pre-purchase entitlement value as settled, and the user would see their just-purchased phase still locked.

Using the native customer center rather than building one is a correctness decision. Cancellation, plan changes, and refund flows have platform rules and platform UI expectations; reimplementing them is how apps end up with users who cannot cancel.

## Alternatives Considered

- **StoreKit 2 directly.** Rejected: entitlement across devices and subscription-state handling are the expensive parts, and this is what RevenueCat exists to absorb.
- **A custom subscription-management screen.** Rejected in favour of the native customer center.
- **RevenueCat's hosted paywall UI.** A wrapper component for it exists in the codebase and is not used by any route. The custom paywall was preferred so the purchase screen matches the app's visual language.
- **An account system with identified users.** Rejected: unnecessary for a single-device product, and it would add a login before the user reaches any value.
- **Failing closed on entitlement-check errors.** Rejected per the asymmetry above.

## Outcomes

A configuration helper exists in the RevenueCat wrapper module and is unused — the root layout calls the SDK's configure function directly instead. Two paths to the same initialization is a small inconsistency worth collapsing.

The unused hosted-paywall wrapper remains in the tree.

## Related

- [Project Intent](../intent/project-intent.md)
- [Feature: Subscription Access](../intent/feature-subscription-access.md)
- [Feature: Onboarding](../intent/feature-onboarding.md)
- [Feature: Phase Management](../intent/feature-phase-management.md)
- [Decision: Tech Stack](001-tech-stack.md)
- [Decision: Expo Router File-Based Routing](002-expo-router-file-based-routing.md)
- [Pattern: Discriminated Outcome Instead of a Boolean](../knowledge/patterns/discriminated-outcome-instead-of-boolean.md)
- [Pattern: Hook Owns a Slice and Persists Before Setting State](../knowledge/patterns/hook-persist-then-set-state.md)
- [Anti-pattern: Onboarding Gate That Fails Closed](../knowledge/anti-patterns/onboarding-gate-that-fails-closed.md)
- [Pattern: Capture Before Degrading](../knowledge/patterns/capture-before-degrading.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Accepted
- **Note**: Documented from existing implementation.
