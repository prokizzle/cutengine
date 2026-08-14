# Decision: Local Swift Expo Modules

## Context

Three capabilities cannot be delivered from JavaScript: reading and writing Apple Health, persisting into a SwiftData container shared with a separate app, and invoking the on-device language model. Each needed a native implementation reachable from React Native.

## Decision

Three Expo native modules authored in-repo under `modules/`, each a private package with its own podspec, rather than published dependencies or a single monolithic module.

- **expo-cycle-store** — SwiftData persistence in a shared App Group container
- **expo-healthkit** — Apple Health read and write
- **expo-nl-cycle-parser** — on-device natural-language protocol parsing

All three share a deliberate shape:

- iOS only, declared in the module config
- Identical podspec structure: iOS 17.0, Swift 5.9, static framework, local path source, whole-module compilation
- Every JavaScript-facing entry point is an async function
- Swift-side work is serialized through an actor
- Structured values cross the bridge through paired record types that convert in both directions and validate on the way in
- Dates cross as ISO-8601 strings, UUIDs as strings, enums as raw strings

Two of the three resolve their native module optionally rather than eagerly. The parser resolves eagerly.

TypeScript types live alongside the Swift types in each module's `src/`, and the pure domain helpers — the ones with no native dependency — live there too, so they are importable and testable without a native build.

## Rationale

Three modules rather than one keeps each boundary honest: HealthKit access does not need to know the persistence schema, and the parser needs neither. Each can be reasoned about, and tested, alone.

Local packages rather than published ones because none of this is reusable outside the product, and publishing would add a release step between writing Swift and running it.

Everything async because SwiftData access is serialized through an actor, and offering a synchronous facade over an actor would either block or lie.

Records that validate on conversion put the boundary check at the boundary. JavaScript can send any shape; the record type is where that becomes either a typed Swift value or a thrown error with a specific reason, rather than a partially-initialized object propagating inward.

Local path sources in the podspecs were chosen so the modules build from the working tree without a separate publish or link step.

Putting the pure domain helpers inside the module's `src/` next to the types they operate on means the profile transformation logic is unit-testable in Jest with no simulator, while still sitting beside the schema it belongs to.

## Alternatives Considered

- **One combined native module.** Rejected: it would couple HealthKit, persistence, and parsing into a single Swift target and a single bridge surface.
- **Published npm packages.** Rejected as unnecessary indirection for code with exactly one consumer.
- **Nitro modules.** `react-native-nitro-modules` is a declared dependency, but the modules are built on the Expo Modules API. The dependency is unused by project code.
- **`expo-health` for HealthKit.** Declared as a dependency and never imported. The local bridge was written instead, which gives control over exactly which types are requested and how authorization failure is reported.

## Outcomes

The parser module resolves its native module eagerly while the other two resolve optionally. On a non-iOS platform the eager resolution throws at import time, before any platform guard in the JavaScript layer can intercept it. The other two modules document this exact hazard as their reason for resolving optionally. See [Anti-pattern: Eager Native Module Resolution](../knowledge/anti-patterns/eager-native-module-resolution.md).

The store's native surface is broader than the app uses: compounds, schedules, dose rules, and meal rules are all implemented and persisted, and only the profile and biofeedback slices are reachable from the app.

## Related

- [Project Intent](../intent/project-intent.md)
- [Feature: Weight Tracking](../intent/feature-weight-tracking.md)
- [Feature: Protocol Entry](../intent/feature-protocol-entry.md)
- [Decision: Tech Stack](001-tech-stack.md)
- [Decision: SwiftData in a Shared App Group](005-swiftdata-app-group-persistence.md)
- [Decision: HealthKit Is the Source of Truth for Weight](006-healthkit-weight-source-of-truth.md)
- [Decision: On-Device Token-Opaque Natural-Language Parsing](010-on-device-token-opaque-nl-parsing.md)
- [Pattern: Native Module Behind a lib Facade](../knowledge/patterns/native-module-behind-lib-facade.md)
- [Pattern: Bridge Record Round Trip](../knowledge/patterns/bridge-record-round-trip.md)
- [Anti-pattern: Eager Native Module Resolution](../knowledge/anti-patterns/eager-native-module-resolution.md)
- [Pattern: Actor-Serialized Upsert](../knowledge/patterns/actor-serialized-upsert.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Accepted
- **Note**: Documented from existing implementation.
