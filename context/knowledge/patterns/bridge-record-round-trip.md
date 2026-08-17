# Pattern: Bridge Record Round Trip

## Description

Every structured value crossing the native bridge does so through a record type with two halves: an initializer that builds it from the domain type, and a validating conversion back to the domain type. Validation happens at the boundary, once, and failure is a typed error naming the reason.

## When to Use

Any structured value passed to or returned from a native module. Scalars and strings pass directly.

## Pattern

- One record type per domain type, with `@Field` properties.
- An empty initializer, required by the bridge.
- An initializer taking the domain type, for the outbound direction.
- A throwing `to<DomainType>()` for the inbound direction, which validates and constructs.
- Guard clauses throwing specific errors — the reason is in the error, not in a log.
- Dates cross as ISO-8601 strings, encoded with fractional seconds and decoded with a plain-ISO fallback, throwing if both parses fail.
- UUIDs cross as strings, parsed on the way in.
- Enumerations cross as raw strings.
- Where a native module returns a hand-built dictionary instead of a record, absent optionals are explicit nulls rather than missing keys.

## Example

The paired shape:

```swift
struct CompoundRecord: Record {
    @Field var id: String = ""
    @Field var name: String = ""
    @Field var halfLifeHours: Double?
    init() {}
    init(_ compound: Compound) { id = compound.id.uuidString; name = compound.name; /* … */ }
    func toCompound() throws -> Compound {
        guard !name.isEmpty else { throw BridgeConversionError.invalidName(name) }
        return try Compound(id: try uuid(id), name: name, /* … */)
    }
}
```

`ExpoBridgeRecords.swift:151-188`

Date bridging, tolerant on the way in and precise on the way out:

```swift
// Encode with .withInternetDateTime + .withFractionalSeconds.
// Decode with fractional first, plain ISO8601 as fallback, else throw .invalidDate.
```

`ExpoBridgeRecords.swift:57-79`, mirrored at `ExpoHealthKitModule.swift:36-46`

The singleton-identity rule enforced at the boundary — whatever identifier JavaScript sent is discarded, so every read and write addresses the same row:

```swift
// ExpoBridgeRecords.swift:344-347 — UserProfileRecord.toUserProfile() ignores the incoming id
```

Where a module builds a dictionary by hand instead of using a record, optionals are explicit:

```swift
// ExpoNLCycleParserModule.swift:3-5 — bridgeOptional maps nil to NSNull()
// so an absent field arrives as null rather than as a missing key.
```

## Files Using This Pattern

- `modules/expo-cycle-store/ios/Sources/ExpoBridgeRecords.swift` — records for every persisted type, plus the date and UUID helpers
- `modules/expo-cycle-store/ios/Sources/ExpoCycleStoreModule.swift` — every entry point takes or returns records
- `modules/expo-healthkit/ios/Sources/ExpoHealthKitModule.swift` — the same date-bridging helpers
- `modules/expo-nl-cycle-parser/ios/Sources/ExpoNLCycleParserModule.swift` — the hand-built dictionary variant with explicit nulls
- `modules/*/src/*.ts` — the TypeScript mirrors of each record shape

## Related

- [Decision: Local Swift Expo Modules](../../decisions/004-local-swift-expo-modules.md)
- [Decision: SwiftData in a Shared App Group](../../decisions/005-swiftdata-app-group-persistence.md)
- [Decision: Singleton Flat Phase Profile](../../decisions/007-singleton-flat-phase-profile.md)
- [Feature: Protocol Entry](../../intent/feature-protocol-entry.md)
- [Feature: Weight Tracking](../../intent/feature-weight-tracking.md)
- [Feature: Body Composition Input](../../intent/feature-body-composition-input.md)
- [Pattern: Actor-Serialized Upsert](actor-serialized-upsert.md)
- [Pattern: Native Module Behind a lib Facade](native-module-behind-lib-facade.md)

## Status

- **Created**: 2026-08-13
- **Status**: Active
