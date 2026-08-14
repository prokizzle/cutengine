# Feature: Compliance Risk Prediction

## What

The app predicts whether the user is about to skip today's check-in, and if the risk is high enough, says so before the day is lost.

The prediction surfaces in two places on the Today screen:

- A status pill in the header reading ON TRACK, WATCH, ACTION NEEDED, or AWAITING DATA.
- A nudge card, shown only when risk is moderate or high, the user has not yet checked in today, and they have not already dismissed it today.

Prediction quality scales with history. Under a week of use the app says nothing. Between one and four weeks it uses a simple day-of-week-aware estimate. Past a month it uses a model trained on the user's own history.

The feature is advisory. It never changes a target, alters a phase, or takes any action on the user's behalf.

## Why

Adherence, not knowledge, is what ends most cuts and bulks. Users do not fail because they picked the wrong macro split; they fail because they stopped logging on a Friday and never came back. A product that only reports what already happened is arriving too late to help.

The specific bet is that skipping is patterned rather than random — weekends, particular weekdays, stretches after a missed day, periods when subjective scores are already low. If the pattern is learnable from a few weeks of one user's data, the app can intervene on the morning of a likely miss rather than commiserating afterwards.

Staying advisory is deliberate. A prediction that silently changed the user's targets would compound its own errors and destroy trust in every other number in the app.

Degrading gracefully by history length is what makes it usable in week two instead of month two. Saying nothing when there is nothing to say is preferable to displaying a confident number derived from four data points.

## Acceptance Criteria

- [x] Nothing is predicted until roughly a week of history exists
- [x] Between one and four weeks, a simpler day-of-week-aware estimate is used
- [x] Past roughly a month, a model trained on the user's own history is used
- [x] Risk is reported at three levels, plus an explicit unknown state
- [x] The header status reflects the current risk level
- [x] The nudge card appears only at moderate or high risk
- [x] The nudge card does not appear if the user already checked in today
- [x] The nudge card can be dismissed for the day
- [x] A day with no check-in counts as a miss
- [x] A phase switch does not invalidate prediction for the days following it
- [x] The prediction never modifies targets, phase, or any stored user data
- [x] Model quality is measurable against a no-skill baseline

## Related

- [Project Intent](project-intent.md)
- [Feature: Daily Check-In](feature-daily-check-in.md)
- [Feature: Phase Management](feature-phase-management.md)
- [Decision: Compliance Prediction Model](../decisions/009-compliance-prediction-model.md)
- [Decision: Colocated Tests and Type-Check CI](../decisions/016-colocated-tests-and-ci.md)
- [Pattern: Null Means Insufficient Evidence](../knowledge/patterns/null-means-insufficient-evidence.md)
- [Pattern: Seeded PRNG Test Fixture](../knowledge/patterns/seeded-prng-test-fixture.md)
- [Pattern: Self-Suppressing Card Component](../knowledge/patterns/self-suppressing-card-component.md)
- [Pattern: Colocated Test Conventions](../knowledge/patterns/colocated-test-conventions.md)
- [Pattern: Named Thresholds With Recorded Rationale](../knowledge/patterns/named-thresholds-with-rationale.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Active (already implemented)
- **Note**: Measured performance is recorded in `docs/compliance-prediction.md`. The model performs well on patterned skippers, modestly on users who change phase mid-history, and at chance on genuinely erratic loggers — which the documentation states plainly rather than reporting only the favourable case.
