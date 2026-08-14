# Pattern: Self-Suppressing Card Component

## Description

A card that has nothing to say returns `null` itself, rather than requiring its parent to know the suppression rule. The condition lives with the component that owns the meaning.

## When to Use

Advisory or conditional cards whose visibility depends on their own data — a risk nudge at low risk, an update banner with no update pending.

Do not use where the parent owns the condition for reasons the component cannot see. The Today screen still decides whether to render the risk card at all based on whether the user checked in today and whether they dismissed it — those are screen concerns. The component only suppresses on the part it owns: the risk level.

## Pattern

- Take the data as a required prop, not a nullable one.
- Return `null` as the first statement when the data implies nothing to display.
- Keep the copy table for each displayable state as a module-level constant keyed on the displayable subset of the union — so the type system enforces that the suppressed case has no copy.

## Example

```ts
export function ComplianceRiskCard({ prediction, onDismiss }: Props) {
  if (prediction.level === "low") return null;
  const copy = COPY[prediction.level];
```
`components/today/ComplianceRiskCard.tsx:22`

Note the copy table's key type — `Record<"moderate" | "high", …>`, excluding `"low"`. The early return is what makes that type valid, so removing the guard breaks compilation rather than producing an undefined lookup at runtime.

The same shape in the update banner, keyed on a boolean prop:

```ts
// components/UpdateBanner.tsx — returns null when !visible
```

## Files Using This Pattern

- `components/today/ComplianceRiskCard.tsx` — suppresses at low risk
- `components/UpdateBanner.tsx` — suppresses when no update is pending
- `components/today/PhaseSuggestionCard.tsx` — structurally near-identical to the risk card; the two duplicate their stylesheets and are a candidate for consolidation

## Related

- [Decision: Compliance Prediction Model](../../decisions/009-compliance-prediction-model.md)
- [Decision: Over-the-Air Updates With Fingerprint Runtime Versioning](../../decisions/014-expo-updates-ota.md)
- [Feature: Compliance Risk Prediction](../../intent/feature-compliance-risk-prediction.md)
- [Feature: Phase Change Suggestions](../../intent/feature-phase-change-suggestions.md)
- [Feature: App Updates](../../intent/feature-app-updates.md)
- [Pattern: Null Means Insufficient Evidence](null-means-insufficient-evidence.md)
- [Pattern: Component Folder Per Surface](component-folder-per-surface.md)
- [Feature: Daily Check-In](../../intent/feature-daily-check-in.md)

## Status

- **Created**: 2026-08-13
- **Status**: Active
