# Decision: On-Device Token-Opaque Natural-Language Parsing

## Context

Users write dosing protocols as prose. Turning that into structured rules is a natural-language task, and the obvious tool is a language model. The obvious implementation — send the text to a hosted model — is unacceptable for this data: it is a record of what a specific person is taking.

## Decision

Parse on the device, using Apple's on-device language model when available, with a deterministic pattern-matching parser behind it. Never expose compound identity to the model.

**Token-opaque prompting.** Before any parsing, known compound names in the input are replaced with opaque positional placeholders. The model receives text containing dosing structure and placeholders, never compound names. Placeholders are mapped back to names after parsing, on the client side.

**The pipeline:**

1. Tokenize — substitute placeholders for known compound names, always, regardless of which parser runs
2. If the on-device model framework is available on this OS version, prompt it and decode its JSON response, tolerating markdown fences
3. Discard any placeholder the model invented that was not in the original substitution map
4. On any throw, empty result, or empty resolution, fall through to the deterministic parser
5. Report which path produced the result

**The deterministic parser** handles the common written forms with pattern matching: a weekly total split across named days, daily, every-other-day, every-N-days, as-needed, and a schedule name. Units are normalized to a single unit.

Everything runs inside the native module. Nothing leaves the device.

## Rationale

The privacy constraint is the premise, not a consideration. This is health data of a kind users have specific reason to keep private, and a hosted model would mean transmitting it. On-device is the only option that satisfies the product's position, and it is what forces every other choice here.

Token substitution is the part worth understanding, because it defends against a threat that on-device execution alone does not. Even a local model is a component with its own logging, telemetry, and future behaviour that this codebase does not control. Substituting placeholders means the strongest identifying signal — which compounds — never enters it. The model sees "500mg/wk split Mon/Thu" attached to a placeholder; the mapping from placeholder to name exists only in the app.

Filtering invented placeholders is the necessary counterpart. A model asked to emit placeholders will sometimes emit ones that were never supplied. Silently resolving those would fabricate rules about compounds the user never mentioned, which in this domain is worse than failing.

The deterministic fallback is what makes the feature shippable at all. The on-device model requires a recent OS, so a substantial share of users would otherwise have no feature. It also handles the case where the model returns something unparseable — which is a normal outcome, not an exception.

Reporting the method keeps the two paths honest. Without it, a silent permanent fallback to pattern matching would look like a working language model.

## Alternatives Considered

- **A hosted language model.** Rejected on privacy grounds. This is the decision the entire design follows from.
- **Sending real compound names to the on-device model.** Rejected: substitution costs almost nothing and removes the most sensitive field from the model's input entirely.
- **Deterministic parsing only.** Simpler and fully predictable, but limited to the forms someone thought to write a pattern for. Kept as the fallback rather than the whole feature.
- **Language model only.** Rejected: excludes older OS versions, and has no recourse when the model returns nothing usable.
- **Trusting the model's placeholder output.** Rejected per the fabrication risk.

## Outcomes

The fallback ladder means the feature works on every supported device, with the model improving results where present rather than being required.

Parsed rules are displayed but not yet persisted. The store supports schedules and dose rules; the protocol screen does not write to it, and the timeline UI that would render an active schedule is built and tested but not wired to any route.

The parser module is the one native module that resolves eagerly rather than optionally, which is a real hazard on non-iOS platforms — see [Anti-pattern: Eager Native Module Resolution](../knowledge/anti-patterns/eager-native-module-resolution.md).

## Related

- [Project Intent](../intent/project-intent.md)
- [Feature: Protocol Entry](../intent/feature-protocol-entry.md)
- [Decision: Local Swift Expo Modules](004-local-swift-expo-modules.md)
- [Decision: Dual Distribution With Seed Stripping](012-dual-distribution-seed-stripping.md)
- [Pattern: Native Module Behind a lib Facade](../knowledge/patterns/native-module-behind-lib-facade.md)
- [Anti-pattern: Eager Native Module Resolution](../knowledge/anti-patterns/eager-native-module-resolution.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Accepted
- **Note**: Documented from existing implementation. Related project memory: `reference_foundationmodels_token_opaque_prompting`.
