# Project Intent: CutEngine

## What

CutEngine is an iOS app for people running a deliberate body-composition phase — cutting, bulking, or maintaining — who want the daily numbers and the daily habit tracked in one place.

It does four things for the user:

1. Sets a daily calorie and macro target from their current weight and the rate of change they are aiming for.
2. Collects a short daily check-in on how they feel, tuned to the phase they are in.
3. Watches their weight trend and tells them when the phase they are running is no longer doing what they intended.
4. Accepts a dosing protocol written in plain English and turns it into a structured schedule.

It ships in two forms: an App Store app, and a separately distributed sideload build that carries an additional bundled compound reference library.

## Why

Phase-based cutting and bulking is arithmetic that people get wrong by hand and abandon within weeks. The specific gaps this product targets:

- Calorie targets go stale. Users set a target once, lose weight, and keep eating to the old number.
- Weight noise hides trend. Day-to-day fluctuation makes people react to signal that is not there, or miss a genuine plateau for a month.
- Adherence is the actual failure mode, not knowledge. Users know what to eat; they stop logging, and then stop entirely. Predicting the day someone is about to skip is more useful than another chart of what they already did.
- Protocol tracking is done in notes apps. Schedules written as prose ("500mg/wk split Mon/Thu, weeks 1-12") are never converted into anything that can remind or track.

## Current State

Shipped and working: onboarding, phase management, calorie and macro targeting, HealthKit weight read/write, the daily biofeedback check-in, compliance-miss risk prediction, phase-change suggestions, natural-language protocol parsing, the subscription paywall and customer center, and over-the-air updates.

Partially built:

- **Total daily energy expenditure is a placeholder.** The daily target is computed from `weightKg × 30`, not from a real expenditure model. The `modules/expo-calorie-engine` directory referenced in `CLAUDE.md` has no source.
- **Meal planning is a static mockup.** Four hard-coded time blocks with fixed food strings; no interactivity or persistence.
- **Several Settings rows are stubs** that raise a placeholder alert: height, date of birth, sex, unit preferences, data export, and reset.
- **The protocol timeline UI is built and tested but wired to nothing.** The components under `components/timeline/` have full test coverage and no screen imports them. Dose events are still mock data.
- **Persistence is broader than the UI.** The native store handles compounds, schedules, dose rules, and meal rules; only the user profile and biofeedback slices are reachable from the app.

Platform reality: iOS only. All three native modules declare `platforms: ["ios"]`, and the JavaScript layer degrades to neutral values elsewhere. Android configuration exists but no Android build is exercised.

## Current Features

- [Onboarding](feature-onboarding.md) — first-launch phase and rate-of-change setup
- [Phase Management](feature-phase-management.md) — cut, bulk, or maintain, with a target rate
- [Calorie and Macro Targets](feature-calorie-macro-targets.md) — daily energy and macronutrient goals
- [Weight Tracking](feature-weight-tracking.md) — read and write body weight through Apple Health
- [Daily Check-In](feature-daily-check-in.md) — short phase-specific biofeedback questionnaire
- [Compliance Risk Prediction](feature-compliance-risk-prediction.md) — flags days the user is likely to skip
- [Phase Change Suggestions](feature-phase-change-suggestions.md) — advisory nudges from the weight trend
- [Protocol Entry](feature-protocol-entry.md) — plain-English dosing schedules parsed into structured rules
- [Meal Plan](feature-meal-plan.md) — placeholder daily eating schedule
- [Subscription Access](feature-subscription-access.md) — Pro entitlement, paywall, and subscription management
- [App Updates](feature-app-updates.md) — over-the-air update delivery
- [Dual Distribution](feature-dual-distribution.md) — App Store build and sideload build from one codebase

## Decisions

- [Decision: Tech Stack](../decisions/001-tech-stack.md)
- [Decision: Expo Router File-Based Routing](../decisions/002-expo-router-file-based-routing.md)
- [Decision: Unistyles for Styling](../decisions/003-unistyles-styling.md)
- [Decision: Local Swift Expo Modules](../decisions/004-local-swift-expo-modules.md)
- [Decision: SwiftData in a Shared App Group](../decisions/005-swiftdata-app-group-persistence.md)
- [Decision: HealthKit Is the Source of Truth for Weight](../decisions/006-healthkit-weight-source-of-truth.md)
- [Decision: Singleton Flat Phase Profile](../decisions/007-singleton-flat-phase-profile.md)
- [Decision: Thermodynamic Calorie Targets](../decisions/008-thermodynamic-calorie-targets.md)
- [Decision: Compliance Prediction Model](../decisions/009-compliance-prediction-model.md)
- [Decision: On-Device Token-Opaque Natural-Language Parsing](../decisions/010-on-device-token-opaque-nl-parsing.md)
- [Decision: RevenueCat Entitlement Gating](../decisions/011-revenuecat-entitlement-gating.md)
- [Decision: Dual Distribution With Seed Stripping](../decisions/012-dual-distribution-seed-stripping.md)
- [Decision: Sentry for Error Reporting](../decisions/013-sentry-error-reporting.md)
- [Decision: Over-the-Air Updates With Fingerprint Runtime Versioning](../decisions/014-expo-updates-ota.md)
- [Decision: No Global State Store](../decisions/015-no-global-state-store.md)
- [Decision: Colocated Tests and Type-Check CI](../decisions/016-colocated-tests-and-ci.md)
- [Decision: Rolling-Average Trend Detection](../decisions/017-rolling-average-trend-detection.md)
- [Decision: Linear Release Automation](../decisions/018-linear-release-automation.md)

## Patterns

- [Pattern: Actor-Serialized Upsert](../knowledge/patterns/actor-serialized-upsert.md)
- [Pattern: Bridge Record Round Trip](../knowledge/patterns/bridge-record-round-trip.md)
- [Pattern: Capture Before Degrading](../knowledge/patterns/capture-before-degrading.md)
- [Pattern: Colocated Test Conventions](../knowledge/patterns/colocated-test-conventions.md)
- [Pattern: Component Folder Per Surface](../knowledge/patterns/component-folder-per-surface.md)
- [Pattern: Controlled Component, Screen Owns State](../knowledge/patterns/controlled-component-screen-owns-state.md)
- [Pattern: Defense in Depth on One Invariant](../knowledge/patterns/defense-in-depth-on-one-invariant.md)
- [Pattern: Discriminated Outcome Instead of a Boolean](../knowledge/patterns/discriminated-outcome-instead-of-boolean.md)
- [Pattern: Hook Owns a Slice and Persists Before Setting State](../knowledge/patterns/hook-persist-then-set-state.md)
- [Pattern: Immutable Domain Mutators](../knowledge/patterns/immutable-domain-mutators.md)
- [Pattern: Named Thresholds With Recorded Rationale](../knowledge/patterns/named-thresholds-with-rationale.md)
- [Pattern: Native Module Behind a lib Facade](../knowledge/patterns/native-module-behind-lib-facade.md)
- [Pattern: Null Means Insufficient Evidence](../knowledge/patterns/null-means-insufficient-evidence.md)
- [Pattern: Pure Domain Function With an Injected Clock](../knowledge/patterns/pure-domain-function-injected-clock.md)
- [Pattern: Seeded PRNG Test Fixture](../knowledge/patterns/seeded-prng-test-fixture.md)
- [Pattern: Selector Composition Chain](../knowledge/patterns/selector-composition-chain.md)
- [Pattern: Self-Suppressing Card Component](../knowledge/patterns/self-suppressing-card-component.md)
- [Pattern: Unistyles Themed Stylesheet](../knowledge/patterns/unistyles-themed-stylesheet.md)
- [Pattern: Variant-Gated Config Plugin](../knowledge/patterns/variant-gated-config-plugin.md)

## Anti-patterns

- [Anti-pattern: Eager Native Module Resolution](../knowledge/anti-patterns/eager-native-module-resolution.md)
- [Anti-pattern: Negated Asset Bundle Patterns](../knowledge/anti-patterns/negated-asset-bundle-patterns.md)
- [Anti-pattern: Onboarding Gate That Fails Closed](../knowledge/anti-patterns/onboarding-gate-that-fails-closed.md)
- [Anti-pattern: Stale Stack Documentation](../knowledge/anti-patterns/stale-stack-documentation.md)

## Agents

- [Agent: Compliance Model Evaluator](../agents/compliance-model-evaluator.md)
- [Agent: Distribution Safety Reviewer](../agents/distribution-safety-reviewer.md)

## Framework

All files under `context/` follow the rules in `../.context-mesh-framework.md`. Change history is in [the changelog](../evolution/changelog.md).

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Active
- **Note**: Generated from existing codebase analysis. This is a rewrite — the repository's first commit is 2026-06-04 and `app.config.ts` declares version 2.0.0, succeeding an earlier native iOS CutEngine that lives in the `bodyengine-ios` monorepo.
