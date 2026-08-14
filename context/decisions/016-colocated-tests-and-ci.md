# Decision: Colocated Tests and Type-Check CI

## Context

The product's correctness lives in arithmetic — calorie targets, macro grams, weight trends, feature vectors, a trained classifier — and in a distribution invariant with an expensive failure. Both needed to be verifiable. The question was what to test, where to put the tests, and what to enforce automatically.

## Decision

**Tests colocated beside their subject**, with Jest under the `jest-expo` preset and `@testing-library/react-native`.

- Every test file sits next to what it tests, named after it
- One `describe` per exported symbol or component; test names are behavioural sentences
- Time is injected as a trailing parameter with a default, never faked. Tests pass frozen dates
- Fixtures are typed with real domain types and built from real production constants, not invented literals
- Component queries prefer accessibility labels, which is also why every interactive element has one
- Negative paths are exercised deliberately: press a disabled control, assert the callback did not fire
- Mocking is minimal — no component or domain module is mocked. Two mechanisms only: a root mock for the styling library so style factories execute, and a spy on the alert API where a confirm flow needs driving
- Determinism is asserted directly where it matters: the classifier trained twice on the same data must produce identical weights

**Continuous integration runs on push and pull request to the main branch**, on a self-hosted runner, and does three things: install with a frozen lockfile, run the type check, and verify the distribution invariant in the packaging plugin source.

The type check is the lint gate — there is no ESLint.

## Rationale

Colocation over a mirrored test tree because a test beside its subject is found and updated by whoever changes the subject. A parallel directory structure is where tests go to rot.

Injecting time rather than faking it is the single most useful testing decision here. Almost every domain function in this codebase depends on the current date — phase week counts, trailing windows, day grids, streaks. A trailing `now` parameter with a default makes all of them pure, testable with a literal date, and free of global timer mocks that leak between tests.

Building fixtures from production constants rather than literals means a test breaks when a real default changes, which is the point. A test asserting an invented number keeps passing while the product's behaviour drifts underneath it.

Querying by accessibility label creates a useful coupling: the label is both the test handle and the screen-reader text, so a component that is hard to query is also inaccessible. That is a constraint worth having.

Testing negative paths by pressing anyway is how disabled state gets verified at all. Asserting that a button renders disabled says nothing about whether pressing it does something.

Not mocking domain modules keeps the tests honest about integration between pure functions, which is where this codebase's real bugs would be.

Type check as the only gate is a minimum, chosen deliberately: one gate that catches real defects rather than a linter configuration to maintain. The gap is real — formatting is unenforced, and no runtime lint rules apply.

Grepping the packaging plugin in continuous integration puts the distribution invariant under automated enforcement at the layer where it is cheapest to check. See [Decision: Dual Distribution With Seed Stripping](012-dual-distribution-seed-stripping.md).

## Alternatives Considered

- **A mirrored `__tests__` tree.** Rejected per the rot argument.
- **Fake timers.** Rejected in favour of parameter injection, which required no test-framework machinery and made the functions pure as a side effect.
- **Snapshot testing components.** Not used anywhere. Snapshots would have caught nothing the behavioural assertions miss, and would break on every style change.
- **ESLint with a shared configuration.** Not adopted. This is an acknowledged gap.
- **Running tests in continuous integration.** Not currently done, despite a test script and full Jest configuration existing. This is the notable gap below.

## Outcomes

Coverage is uneven in a way worth stating plainly:

- Every utility module has a colocated test except the synthetic-data generator, which is itself a fixture
- Thirteen of seventeen components have tests
- Hooks, selectors, and the pure profile helpers are tested
- **No screen under `app/` has any test** — the routing, the onboarding gate, and the Today screen's derivation logic are untested

**Continuous integration does not run the test suite.** It installs, type-checks, and greps the packaging plugin. The entire Jest suite is therefore only ever run locally, by whoever remembers. This is the largest gap in the setup: a broken test can be merged.

The style-asserting test in the timeline hero redeclares theme colour constants locally, which — together with the token table duplicated in the styling mock — means theme colours exist in three places.

## Related

- [Project Intent](../intent/project-intent.md)
- [Feature: Compliance Risk Prediction](../intent/feature-compliance-risk-prediction.md)
- [Feature: Dual Distribution](../intent/feature-dual-distribution.md)
- [Decision: Tech Stack](001-tech-stack.md)
- [Decision: Unistyles for Styling](003-unistyles-styling.md)
- [Decision: Dual Distribution With Seed Stripping](012-dual-distribution-seed-stripping.md)
- [Decision: Compliance Prediction Model](009-compliance-prediction-model.md)
- [Pattern: Colocated Test Conventions](../knowledge/patterns/colocated-test-conventions.md)
- [Pattern: Pure Domain Function With an Injected Clock](../knowledge/patterns/pure-domain-function-injected-clock.md)
- [Pattern: Seeded PRNG Test Fixture](../knowledge/patterns/seeded-prng-test-fixture.md)
- [Pattern: Defense in Depth on One Invariant](../knowledge/patterns/defense-in-depth-on-one-invariant.md)
- [Decision: Linear Release Automation](018-linear-release-automation.md)
- [Pattern: Component Folder Per Surface](../knowledge/patterns/component-folder-per-surface.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Accepted, with a known gap — the test suite is not run in continuous integration
- **Note**: Documented from existing implementation.
