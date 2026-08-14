# Pattern: Actor-Serialized Upsert

## Description

All SwiftData access goes through one `public actor` singleton holding one shared model context. Writes fetch by identifier, then update field-by-field or insert, then save once. Substructures that are only ever read and written whole are stored as encoded JSON, with typed decode errors naming the offending record.

## When to Use

Every persistence operation in the cycle store. Do not open a second model context.

## Pattern

- One actor, one shared context. Every entry point is `async` as a consequence.
- Hoist the identifier into a local before building a predicate — a predicate cannot capture a member reference.
- Fetch by identifier; if found, assign changed fields; otherwise insert a freshly constructed entity.
- Exactly one `save()` per operation.
- Enumerations persist as raw string columns; nested value types persist as JSON blobs.
- Decoding a blob throws a typed error carrying the record identifier, so a corrupt row is identifiable rather than silently partial.
- Provide an in-memory initializer for tests, and an initializer that attaches to an externally supplied container so a sibling app can share the schema.

## Example

The upsert, including the predicate hoist and its reason:

```swift
let compoundID = compound.id                      // hoisted: #Predicate can't capture members
let descriptor = FetchDescriptor<CompoundEntity>(predicate: #Predicate { $0.id == compoundID })
if let existing = try ctx.fetch(descriptor).first {
    existing.name = compound.name
    // … field-by-field assignment
} else {
    ctx.insert(CompoundEntity(from: compound))
}
try ctx.save()
```
`CycleStore.swift:95-112`

A blob decode that fails loudly and specifically:

```swift
private func decodedCadence() throws -> DoseRule.Cadence {
    guard let data = cadenceData else { throw StoreError.missingCadenceData(ruleID: id) }
    do { return try JSONDecoder().decode(DoseRule.Cadence.self, from: data) }
    catch { throw StoreError.invalidCadenceData(ruleID: id) }
}
```
`Models.swift:96-105`

The singleton-row variant, which never returns nothing:

```swift
// CycleStore.swift:253-262 — userProfile() inserts the default on first fetch,
// eliminating a nullable branch at every consumer.
// hasUserProfile() is the separate, non-creating existence probe.
```

The insert-on-read side effect is why the app's onboarding gate must call the existence probe, and must resolve before any screen calls the getter.

## Files Using This Pattern

- `modules/expo-cycle-store/ios/Sources/CycleStore.swift` — the actor, its three initializers, and every operation
- `modules/expo-cycle-store/ios/Sources/Models.swift` — the six entities, their blob columns, and typed decode errors
- `modules/expo-cycle-store/ios/Sources/ExpoCycleStoreModule.swift` — every bridge entry point is an async function delegating to the actor

## Related

- [Decision: SwiftData in a Shared App Group](../../decisions/005-swiftdata-app-group-persistence.md)
- [Decision: Singleton Flat Phase Profile](../../decisions/007-singleton-flat-phase-profile.md)
- [Decision: Local Swift Expo Modules](../../decisions/004-local-swift-expo-modules.md)
- [Decision: Expo Router File-Based Routing](../../decisions/002-expo-router-file-based-routing.md)
- [Feature: Daily Check-In](../../intent/feature-daily-check-in.md)
- [Feature: Meal Plan](../../intent/feature-meal-plan.md)
- [Pattern: Bridge Record Round Trip](bridge-record-round-trip.md)
- [Pattern: Immutable Domain Mutators](immutable-domain-mutators.md)

## Status

- **Created**: 2026-08-13
- **Status**: Active
