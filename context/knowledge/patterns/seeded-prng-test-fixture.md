# Pattern: Seeded PRNG Test Fixture

## Description

Where a test needs a plausible multi-month history rather than three hand-written rows, a seeded pseudo-random generator produces it deterministically. The same generator is used by the test suite and by the evaluation script that produces the published performance numbers.

## When to Use

Testing statistical or aggregate behaviour, where the assertion is about a property of the result over realistic data rather than an exact value from a specific input. Also for reproducing published measurements.

Do not use for unit tests of pure arithmetic — those get literal inputs and exact expected values.

## Pattern

- A small self-contained PRNG (mulberry32 here), seeded from an argument.
- A generator function taking a specification — phase spans, per-day-of-week miss probabilities — plus a seed and a fixed `now`.
- Default `now` is a fixed date literal, not the current time.
- The generator lives in the source tree, not in a test file, because two consumers need it: the tests and the evaluation script.
- The same seed always produces the same history, so a failing assertion is reproducible.

## Example

The generator is specified declaratively and returns everything a consumer needs — entries, a matching profile, and the anchoring moment:

```ts
// utils/syntheticCompliance.ts:9 — mulberry32(seed)
// generate(specs, { seed, now }) → { entries, profile, now }
// Each day is missed with probability missByDow[dow];
// completed days get five answers with scores drawn from the same stream.
// Default now = a fixed date literal, never new Date().
```

Consumed by the test suite:

```ts
// utils/compliancePredictor.test.ts:11
```

and by the script that produces the numbers in `docs/compliance-prediction.md`:

```ts
// scripts/eval-compliance-model.ts:6 — three archetypes × five seeds,
// reporting cross-phase against phase-restricted training
```

The consequence worth naming: the assertions in continuous integration and the figures in the documentation are generated from the same code path. A change that improves the published numbers must also keep the tests passing, and vice versa — they cannot drift apart.

## Files Using This Pattern

- `utils/syntheticCompliance.ts` — the generator; deliberately the one `utils/` module with no test of its own, being a fixture
- `utils/compliancePredictor.test.ts` — consumes it for prediction and evaluation assertions
- `scripts/eval-compliance-model.ts` — consumes it to reproduce the documented results across three user archetypes and several seeds
- `docs/compliance-prediction.md` — the published output

## Related

- [Decision: Compliance Prediction Model](../../decisions/009-compliance-prediction-model.md)
- [Decision: Colocated Tests and Type-Check CI](../../decisions/016-colocated-tests-and-ci.md)
- [Feature: Compliance Risk Prediction](../../intent/feature-compliance-risk-prediction.md)
- [Pattern: Colocated Test Conventions](colocated-test-conventions.md)
- [Pattern: Pure Domain Function With an Injected Clock](pure-domain-function-injected-clock.md)

## Status

- **Created**: 2026-08-13
- **Status**: Active
