# Feature: Subscription Access

## What

Bulking and maintenance phases are paid. Cutting is free.

A user who selects a paid phase without a subscription is shown a paywall listing the available plans, with annual and lifetime options highlighted. They can purchase, or restore a purchase made previously.

Purchasing or restoring successfully returns them to the app with the phase now selectable. Cancelling is silent — no error, no message. A user who is already subscribed never sees the paywall at all; opening it sends them straight back.

Subscribers manage their subscription from Settings through a native subscription-management screen, which handles cancellation, plan changes, and restore.

## Why

Cutting is the entry point and the largest audience, so it stays free — the product needs users inside it before it can ask for anything. Bulking and maintenance are the phases people commit to over months, which makes them the point where paying for a coach is a proposition the user is already entertaining.

Gating at phase selection rather than behind a trial timer means the paywall appears at a moment of stated intent: the user has just told the app they want to bulk. That is a better ask than an interruption on day seven.

Treating cancellation as silent is a deliberate courtesy. A user who backs out of a purchase has not encountered an error and should not be told they have.

Using a native subscription-management surface rather than a custom one is about correctness — cancellation, refunds, and plan changes have platform rules, and reimplementing them is how apps end up with users who cannot cancel.

## Acceptance Criteria

- [x] Cutting is available without a subscription
- [x] Bulking and maintenance require a subscription
- [x] Selecting a gated phase without a subscription opens the paywall
- [x] The paywall lists available plans with annual and lifetime emphasised
- [x] A purchase can be made from the paywall
- [x] A previous purchase can be restored
- [x] Successful purchase or restore returns the user to the app with access granted
- [x] Cancelling a purchase produces no error message
- [x] An already-subscribed user opening the paywall is returned to the app
- [x] Subscription management is reachable from Settings
- [x] Entitlement is re-checked when the user returns to a gated screen, not cached for the session
- [x] A failed entitlement check does not lock a paying user out

## Related

- [Project Intent](project-intent.md)
- [Feature: Onboarding](feature-onboarding.md)
- [Feature: Phase Management](feature-phase-management.md)
- [Decision: RevenueCat Entitlement Gating](../decisions/011-revenuecat-entitlement-gating.md)
- [Decision: Expo Router File-Based Routing](../decisions/002-expo-router-file-based-routing.md)
- [Pattern: Discriminated Outcome Instead of a Boolean](../knowledge/patterns/discriminated-outcome-instead-of-boolean.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Active (already implemented)
- **Note**: A wrapper for RevenueCat's own hosted paywall UI exists alongside the custom paywall but is not currently used by any route.
