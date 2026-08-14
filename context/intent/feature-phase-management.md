# Feature: Phase Management

## What

The user's phase — cutting, bulking, or maintaining — is the single setting that shapes everything else in the app. From Settings the user can:

- Switch phase, with a confirmation prompt, which resets the phase start date so week counting begins again.
- Choose a target rate of weight change per week from four named tiers, or accept the default for the phase.
- Override the macronutrient split for the current phase, or revert to the default split.

Bulking and maintenance require a subscription; attempting to select either without one sends the user to the paywall.

The app displays how long the user has been in the current phase, both as a duration ("Bulking for 12 weeks") and as a week number ("Bulk Week 8").

Each phase carries its own defaults: a starting macro split and a default weekly rate. Bulking rates are capped, so a user cannot set a surplus aggressive enough to be counterproductive.

## Why

Phase is the user's stated intent, and stating it explicitly is what lets the app be opinionated instead of neutral. The same weight loss is success in a cut and failure in a bulk; the same hunger score means something different in each. Without a declared phase, every piece of feedback the app gives would have to be hedged.

Resetting the clock on a phase switch matters because users judge progress against "how long have I been doing this," and carrying a stale start date forward silently invalidates every trend judgment that follows.

Capping bulk rates protects users from themselves: the tier list is the product's opinion about what a productive surplus looks like, expressed as a constraint rather than a warning.

## Acceptance Criteria

- [x] Phase can be switched between cutting, bulking, and maintenance
- [x] Switching phase requires explicit confirmation
- [x] Switching phase resets the phase start date
- [x] Each phase has a default target rate and a default macro split
- [x] The user can pick a target rate from four phase-appropriate tiers
- [x] Cutting tiers represent loss, bulking tiers represent gain, maintenance is zero
- [x] Bulk target rates are capped at a maximum
- [x] The macro split can be overridden per phase and reverted to default
- [x] A macro split must total 100 percent to be accepted
- [x] Bulking and maintenance are gated behind a subscription
- [x] Time in the current phase is displayed as both a duration and a week number

## Related

- [Project Intent](project-intent.md)
- [Feature: Onboarding](feature-onboarding.md)
- [Feature: Calorie and Macro Targets](feature-calorie-macro-targets.md)
- [Feature: Phase Change Suggestions](feature-phase-change-suggestions.md)
- [Feature: Subscription Access](feature-subscription-access.md)
- [Decision: Singleton Flat Phase Profile](../decisions/007-singleton-flat-phase-profile.md)
- [Decision: Thermodynamic Calorie Targets](../decisions/008-thermodynamic-calorie-targets.md)
- [Decision: RevenueCat Entitlement Gating](../decisions/011-revenuecat-entitlement-gating.md)
- [Pattern: Immutable Domain Mutators](../knowledge/patterns/immutable-domain-mutators.md)
- [Pattern: Hook Owns a Slice and Persists Before Setting State](../knowledge/patterns/hook-persist-then-set-state.md)
- [Feature: Compliance Risk Prediction](feature-compliance-risk-prediction.md)
- [Feature: Daily Check-In](feature-daily-check-in.md)
- [Pattern: Controlled Component, Screen Owns State](../knowledge/patterns/controlled-component-screen-owns-state.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Active (already implemented)
