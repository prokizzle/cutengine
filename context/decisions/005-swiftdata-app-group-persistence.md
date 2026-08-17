# Decision: SwiftData in a Shared App Group

## Context

The user's phase needs to be readable by CardioEngine, a separate app from the same publisher. Two apps that each keep their own copy of "what phase is this person in" will disagree, and the disagreement will be invisible until a user notices two apps giving contradictory advice.

Beyond the profile, the app needs local persistence for the daily check-in history and — eventually — compounds, schedules, dose rules, and meal plans.

## Decision

SwiftData, in a store file inside a shared App Group container, accessed exclusively through a single actor.

- One store file in the App Group container shared with CardioEngine
- Six model entities: compound, schedule, dose rule, meal rule, user profile, biofeedback entry — each with a unique identifier attribute
- A `public actor` singleton owning one shared model context; all access goes through it
- Non-scalar substructures stored as encoded JSON blobs rather than modelled relationships: cadences, macro overrides, check-in answers, meal items
- Enumerations stored as raw string columns
- An in-memory initializer for tests, and a third initializer that attaches to an externally supplied container, which is how CardioEngine consumes the same schema
- Writes follow fetch-by-identifier, then update-in-place or insert, then a single save

## Rationale

The App Group is the entire reason for this design. Two apps sharing one store file cannot disagree about phase, because there is only one copy.

An actor rather than SwiftData's own model-actor macro is a documented choice in the source: a single serialized context is simpler to reason about than concurrent contexts, and the actor makes serialization explicit at the type level. Every entry point being async falls out of this.

JSON blobs for substructures is a considered trade. A cadence is a closed enumeration with associated values — daily, every N days, specific days, cyclical, every N hours, as-needed — and modelling that as SwiftData relationships would mean several entities and joins to represent something that is only ever read and written whole. The blob is opaque to queries, which is acceptable because nothing queries inside a cadence. Decode failures throw a typed error naming the offending record rather than returning a partial value.

Raw string columns for enumerations keep the store readable and migration-tolerant: adding a case does not require a schema migration, and an unrecognized value is detectable rather than silently coerced.

Fetch-then-upsert rather than relying on unique-constraint upsert behaviour makes the update path explicit and field-by-field, which matters when only some fields should change.

## Alternatives Considered

- **A separate store per app, synchronized.** Rejected: this is the problem the App Group solves, and any synchronization scheme introduces a window in which the two apps disagree.
- **Core Data directly.** SwiftData was chosen for the Swift-native model declaration; the deployment target of iOS 17 makes it available.
- **`@ModelActor`.** Explicitly rejected in the source in favour of one hand-written actor with one shared context.
- **Modelled relationships for cadences and answers.** Rejected in favour of JSON blobs, on the grounds that nothing queries inside them.
- **A JavaScript-side store such as SQLite or AsyncStorage.** Would have forfeited sharing with CardioEngine entirely.

## Outcomes

Four of the six entities — compound, schedule, dose rule, meal rule — are fully implemented in Swift and exposed across the bridge, and no application code reads or writes them. The persistence layer is ahead of the UI.

The JSON-blob decision has held: cadence shapes have not needed a migration.

## Related

- [Project Intent](../intent/project-intent.md)
- [Feature: Daily Check-In](../intent/feature-daily-check-in.md)
- [Feature: Meal Plan](../intent/feature-meal-plan.md)
- [Decision: Local Swift Expo Modules](004-local-swift-expo-modules.md)
- [Decision: Singleton Flat Phase Profile](007-singleton-flat-phase-profile.md)
- [Decision: HealthKit Is the Source of Truth for Body Measurements](006-healthkit-weight-source-of-truth.md)
- [Pattern: Actor-Serialized Upsert](../knowledge/patterns/actor-serialized-upsert.md)
- [Pattern: Bridge Record Round Trip](../knowledge/patterns/bridge-record-round-trip.md)
- [Pattern: Immutable Domain Mutators](../knowledge/patterns/immutable-domain-mutators.md)
- [Pattern: Native Module Behind a lib Facade](../knowledge/patterns/native-module-behind-lib-facade.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Accepted
- **Note**: Documented from existing implementation.
