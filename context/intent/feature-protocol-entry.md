# Feature: Protocol Entry

## What

The user types their dosing protocol as ordinary prose — the way they would write it in a notes app — and the app turns it into structured rules.

Text like "500mg/wk split Mon/Thu, weeks 1-12" becomes a rule with an amount, a cadence, specific days, and a week range. The parsed result lists each rule with its schedule name, the compound it applies to, and a readable description of its cadence.

Parsing happens entirely on the device. Two paths exist: an on-device language model when the OS provides one, and a pattern-matching parser otherwise. The result reports which path produced it. The user never has to know or care, except that the label tells them.

Compound names are never sent to the language model. They are replaced with opaque placeholders before the text is handed over, and mapped back afterwards.

## Why

Protocol tracking today happens in notes apps, because every structured tool demands the user re-enter a schedule they have already written down in a form they find natural. Meeting them at the prose is the entire feature — it is the difference between a tool they use and a tool they abandon at the data-entry step.

Doing it on the device rather than on a server is not a performance choice. This is sensitive information about what someone is taking, and the product's position is that it does not leave the phone. That constraint is what forces the on-device model, and the placeholder substitution is what holds the line even against the on-device model: the model sees dosing structure, never what the compounds are.

Keeping a deterministic parser behind the model means the feature works on devices without the model at all, and works when the model returns something unusable. Reporting which path ran keeps that honest rather than hidden.

## Acceptance Criteria

- [x] Free-text protocol input is accepted
- [x] Parsed output lists structured rules with amount, cadence, and applicable weeks
- [x] Common cadence forms are recognised: weekly totals split across days, daily, every-other-day, every-N-days, as-needed
- [x] Dose units are normalised to a single unit
- [x] A schedule name is extracted when the text contains one
- [x] Compound identity is never exposed to the language model
- [x] Compound placeholders are resolved back to names in the result
- [x] Placeholders the model invents are discarded rather than surfaced
- [x] Parsing falls back to the deterministic parser when the model is unavailable, errors, or returns nothing usable
- [x] The result reports which parsing path produced it
- [x] Parsing never leaves the device

## Related

- [Project Intent](project-intent.md)
- [Decision: On-Device Token-Opaque Natural-Language Parsing](../decisions/010-on-device-token-opaque-nl-parsing.md)
- [Decision: Local Swift Expo Modules](../decisions/004-local-swift-expo-modules.md)
- [Decision: Dual Distribution With Seed Stripping](../decisions/012-dual-distribution-seed-stripping.md)
- [Pattern: Native Module Behind a lib Facade](../knowledge/patterns/native-module-behind-lib-facade.md)
- [Feature: Dual Distribution](feature-dual-distribution.md)
- [Anti-pattern: Eager Native Module Resolution](../knowledge/anti-patterns/eager-native-module-resolution.md)
- [Pattern: Bridge Record Round Trip](../knowledge/patterns/bridge-record-round-trip.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Active (already implemented)
- **Note**: Parsed rules are displayed but not yet persisted or scheduled. The store supports schedules and dose rules; the protocol screen does not yet write to it, and the timeline UI that would display an active schedule is built but not wired to a screen.
