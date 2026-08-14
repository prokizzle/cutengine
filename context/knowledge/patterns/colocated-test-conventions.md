# Pattern: Colocated Test Conventions

## Description

Tests sit beside their subject, are named after it, and are written against real domain types and real production constants. Time is injected rather than faked. Mocking is deliberately near-zero.

## When to Use

Every new utility, hook, selector, and component.

## Pattern

- File name `<subject>.test.ts(x)`, in the same directory as the subject.
- One `describe` per exported symbol or component; `it` names are behavioural sentences.
- Fixtures built from **real domain types and real production constants**, spread-overridden per test. Never invented literals where a production constant exists.
- Frozen date literals passed as the injected `now` parameter. No fake timers anywhere in this repository.
- Component queries prefer `getByLabelText`, matching the accessibility-label convention. `getByText` with a regex for copy, `getByPlaceholderText` for inputs, `queryByText(...)` plus `toBeNull()` for absence.
- Negative paths exercised by acting anyway and asserting the callback did not fire.
- Exact values for deterministic arithmetic; `toBeCloseTo` for float conversion and normalized features. Where a feature vector index is asserted, the arithmetic goes in a comment beside it.
- Acceptance thresholds tagged with the issue identifier they come from.
- Determinism asserted directly where it matters.

## Example

A fixture built from a production constant, so the test breaks if the real default changes:

```ts
// components/settings/PhaseSettings.test.tsx — uses SURPLUS_TIERS[0].weeklyDeltaKg,
// not a hardcoded 0.25
```

Determinism asserted as a property:

```ts
expect(trainLogistic(xs, ys)).toEqual(trainLogistic(xs, ys));
```
`utils/logisticRegression.test.ts`

An acceptance threshold carrying its provenance:

```ts
expect(evaluation.accuracy).toBeGreaterThan(0.7); // (CUTIOS-12)
```
`utils/compliancePredictor.test.ts`

Driving a confirmation flow by spying on the alert API — one of only two mocking mechanisms used anywhere:

```ts
const alertSpy = jest.spyOn(Alert, "alert").mockImplementation((_t, _m, buttons) => {
  buttons?.find((b) => b.text === "Switch")?.onPress?.();
});
```
`components/settings/PhaseSettings.test.tsx:51`

The other mechanism is the root mock at `__mocks__/react-native-unistyles.ts`, which executes style factories against a duplicate of the theme so tests can assert real colour values. **It duplicates the token table and must be updated alongside `unistyles.ts`.**

Style assertion, where it happens at all, flattens with core React Native:

```ts
function colorOf(node: { props: { style?: unknown } }): string | undefined {
  const flat = StyleSheet.flatten(node.props.style) as { color?: string } | undefined;
  return flat?.color;
}
```
`components/timeline/TimelineHero.test.tsx:6-12`

## What is not done

No snapshots. No `@testing-library/jest-native` matchers. No component or domain module is ever mocked — only the styling library and the alert API. Hook tests mock at the `lib/` boundary, which is the intended seam.

## Coverage as it stands

Every `utils/` module has a test except the synthetic-data generator, which is itself a fixture. Thirteen of seventeen components have tests. Hooks, selectors, and the pure profile helpers are covered. **No screen under `app/` has any test**, and **the suite is not run in continuous integration** — see [Decision: Colocated Tests and Type-Check CI](../../decisions/016-colocated-tests-and-ci.md).

## Files Using This Pattern

- `utils/*.test.ts` — all domain modules
- `selectors/timeline.test.ts` — including memoization assertions via recomputation counts
- `hooks/useHealthKit.test.ts` — mocks the `lib/` boundary and a minimal React Native surface
- `modules/expo-cycle-store/src/userProfile.test.ts` — pure profile helpers, no native build needed
- `components/{today,timeline,paywall,settings}/*.test.tsx`
- `__mocks__/react-native-unistyles.ts` — the root styling mock
- `utils/syntheticCompliance.ts` — the shared seeded fixture generator

## Related

- [Decision: Colocated Tests and Type-Check CI](../../decisions/016-colocated-tests-and-ci.md)
- [Decision: Unistyles for Styling](../../decisions/003-unistyles-styling.md)
- [Feature: Compliance Risk Prediction](../../intent/feature-compliance-risk-prediction.md)
- [Feature: Daily Check-In](../../intent/feature-daily-check-in.md)
- [Pattern: Pure Domain Function With an Injected Clock](pure-domain-function-injected-clock.md)
- [Pattern: Seeded PRNG Test Fixture](seeded-prng-test-fixture.md)
- [Pattern: Component Folder Per Surface](component-folder-per-surface.md)
- [Pattern: Unistyles Themed Stylesheet](unistyles-themed-stylesheet.md)
- [Pattern: Selector Composition Chain](selector-composition-chain.md)

## Status

- **Created**: 2026-08-13
- **Status**: Active
