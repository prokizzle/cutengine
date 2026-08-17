# Decision: Singleton Flat Phase Profile

## Context

The user profile is read by nearly every screen and by every domain calculation. It needed a shape, an identity, and a policy for what happens when it does not exist yet.

A design note for this work is recorded at `docs/superpowers/specs/2026-06-10-cutios-16-userprofile-phase-mode-design.md`.

## Decision

One profile row, at a fixed known identifier, holding a flat current-phase model.

- A single row with a hardcoded identifier — there is one user, and the store holds one profile
- Fields: current phase, phase start date, per-phase macro overrides, and one signed target rate of change per week
- No phase history. Switching phase overwrites the current phase and resets the start date
- Absent macro overrides mean "use the default for this phase"; there is no null-versus-default ambiguity
- One signed rate covers all three phases: negative for cutting, positive for bulking, zero for maintenance
- The getter never returns nothing — on first read it inserts the default profile and returns it
- A separate non-creating existence probe exists for the onboarding gate
- Whatever identifier JavaScript sends is discarded on write, so reads, writes, and the existence probe always address the same row
- Native validation on write: macro ratios finite and within range, per-phase ratios summing to approximately one, and the target rate within a bounded range — with a typed error naming the reason on failure

## Rationale

A getter that cannot return nothing eliminates a nullable branch at every consumer, which is the majority of the codebase. The cost is that reading the profile has a side effect on first call — and that cost is exactly why the existence probe exists as a separate operation, and why the onboarding gate must run before any screen calls the getter.

Discarding the client-supplied identifier is what makes the singleton actually singular. A client that sent a different identifier would otherwise create a second profile that the existence probe would not find.

One signed rate rather than separate deficit and surplus fields removes an entire class of bug: there is no way to have a stale surplus value contradicting an active cut, because there is one field and it has one sign. Maintenance is handled by ignoring the field rather than by requiring it to be zero.

No phase history is a deliberate scope limit recorded in the design note. Week counting and trend comparison both need only the current phase and its start date. History would be needed for retrospective reporting, which the product does not offer.

Validating in Swift on write, rather than only in TypeScript, puts the invariant where it cannot be bypassed — the store is shared with another app, and the other app is not bound by this app's TypeScript types.

## Alternatives Considered

- **A phase history log with the current phase derived from the latest entry.** Rejected as unnecessary for the features that exist; recorded in the design note as a deliberate limitation rather than an oversight.
- **A nullable getter.** Rejected: it pushes a null check into every consumer to express a state that only exists before onboarding completes.
- **Separate fields for deficit and surplus rate.** Rejected: two fields that must not disagree.
- **Storing weight on the profile.** Rejected — see [Decision: HealthKit Is the Source of Truth for Body Measurements](006-healthkit-weight-source-of-truth.md).
- **Validating only in TypeScript.** Rejected because the store is shared across apps.

## Outcomes

The insert-on-read behaviour is the reason the onboarding gate had to move out of the root layout and into the tab group layout — see [Decision: Expo Router File-Based Routing](002-expo-router-file-based-routing.md). This is a real coupling: the profile design constrains where the navigation gate can live.

The default profile is a cut at half a kilogram of loss per week, which means a user who somehow bypasses onboarding lands in a sensible state rather than a broken one.

## Related

- [Project Intent](../intent/project-intent.md)
- [Feature: Onboarding](../intent/feature-onboarding.md)
- [Feature: Phase Management](../intent/feature-phase-management.md)
- [Decision: Expo Router File-Based Routing](002-expo-router-file-based-routing.md)
- [Decision: SwiftData in a Shared App Group](005-swiftdata-app-group-persistence.md)
- [Decision: HealthKit Is the Source of Truth for Body Measurements](006-healthkit-weight-source-of-truth.md)
- [Decision: Thermodynamic Calorie Targets](008-thermodynamic-calorie-targets.md)
- [Pattern: Immutable Domain Mutators](../knowledge/patterns/immutable-domain-mutators.md)
- [Pattern: Actor-Serialized Upsert](../knowledge/patterns/actor-serialized-upsert.md)
- [Decision: Compliance Prediction Model](009-compliance-prediction-model.md)
- [Decision: No Global State Store](015-no-global-state-store.md)
- [Decision: Rolling-Average Trend Detection](017-rolling-average-trend-detection.md)
- [Anti-pattern: Onboarding Gate That Fails Closed](../knowledge/anti-patterns/onboarding-gate-that-fails-closed.md)
- [Pattern: Bridge Record Round Trip](../knowledge/patterns/bridge-record-round-trip.md)
- [Pattern: Hook Owns a Slice and Persists Before Setting State](../knowledge/patterns/hook-persist-then-set-state.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Accepted
- **Note**: Documented from existing implementation. Original design note: `docs/superpowers/specs/2026-06-10-cutios-16-userprofile-phase-mode-design.md`.
