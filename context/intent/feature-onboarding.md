# Feature: Onboarding

## What

On first launch, the app asks the user three things and then puts them straight into the app:

1. A welcome screen explaining what CutEngine does.
2. Which phase they are running: cutting, bulking, or maintaining.
3. How fast they want to move — a rate of weight change per week, presented as four named tiers appropriate to the phase they picked.

Choosing maintenance skips the third question, because there is no target rate to set.

Bulking and maintenance are paid capabilities. Selecting either without an active subscription routes the user to the paywall; returning from the paywall with a subscription unlocks the choice in place, without restarting onboarding.

Onboarding runs exactly once. A user who already has a profile is sent to the main app, and the back gesture is disabled during the flow so they cannot leave it half-finished.

## Why

The product's entire value depends on knowing the user's phase and target rate — every calorie number, every macro split, every check-in question, and every trend judgment is phase-specific. Without those two answers the app has nothing to say.

Asking for phase first, rather than height and age and activity level, is a deliberate bet: it gets the user to a useful daily number in under thirty seconds, and it puts the paid capability in front of them at the moment they are most motivated rather than burying it in settings.

## Acceptance Criteria

- [x] A user with no saved profile is taken to onboarding rather than the main app
- [x] A user with a saved profile never sees onboarding again
- [x] Phase selection offers cutting, bulking, and maintenance
- [x] Bulking and maintenance are marked as paid and route to the paywall when unentitled
- [x] Returning from a successful purchase unlocks the previously locked phase without losing progress
- [x] Maintenance completes without asking for a target rate
- [x] Cutting and bulking each offer four rate tiers, with cutting rates negative and bulking rates positive
- [x] Completing the flow saves the profile and lands the user in the main app
- [x] A save failure tells the user it failed and lets them retry, rather than dropping them into the app with no profile
- [x] The user cannot gesture back out of onboarding

## Related

- [Project Intent](project-intent.md)
- [Feature: Phase Management](feature-phase-management.md)
- [Feature: Subscription Access](feature-subscription-access.md)
- [Decision: Singleton Flat Phase Profile](../decisions/007-singleton-flat-phase-profile.md)
- [Decision: RevenueCat Entitlement Gating](../decisions/011-revenuecat-entitlement-gating.md)
- [Decision: Expo Router File-Based Routing](../decisions/002-expo-router-file-based-routing.md)
- [Anti-pattern: Onboarding Gate That Fails Closed](../knowledge/anti-patterns/onboarding-gate-that-fails-closed.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Active (already implemented)
