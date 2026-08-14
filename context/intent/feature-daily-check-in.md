# Feature: Daily Check-In

## What

Once a day the user answers a short questionnaire about how they feel, rating each item from one to five. The questions differ by phase: a cut asks about the things that go wrong when cutting, a bulk asks about the things that go wrong when bulking, and maintenance asks a shorter set.

The card has three states: an invitation to check in, an expanded set of rating rows, and a confirmation once the day is logged. Saving is disabled until every question has an answer.

Each saved answer keeps the wording of the question it answered, so revising the questionnaire later never rewrites what a user was actually asked.

## Why

Weight alone cannot tell the user whether their phase is working. A cut that is going well and a cut that is destroying someone's sleep produce the same number on the scale. The check-in is how subjective cost gets into the record.

It also serves the product's other purpose: the check-in is the daily habit. Whether the user completes it is the adherence signal that the compliance prediction runs on, which means the check-in is simultaneously the data and the behaviour being measured.

Asking phase-specific questions is what keeps it short enough to actually complete. A single generic questionnaire long enough to cover all three phases would be abandoned within a week.

Storing the prompt alongside the score is a data-integrity commitment: historical entries stay truthful even after the question set changes.

## Acceptance Criteria

- [x] The questionnaire presented matches the user's current phase
- [x] Each question is answered on a one-to-five scale with labelled extremes
- [x] Saving is disabled until every question has an answer
- [x] A completed day shows a confirmation instead of the form
- [x] Only one entry is kept per calendar day
- [x] Each stored answer retains the exact wording of the question asked
- [x] Entries record which phase the user was in at the time

## Related

- [Project Intent](project-intent.md)
- [Feature: Compliance Risk Prediction](feature-compliance-risk-prediction.md)
- [Feature: Phase Management](feature-phase-management.md)
- [Decision: SwiftData in a Shared App Group](../decisions/005-swiftdata-app-group-persistence.md)
- [Decision: Compliance Prediction Model](../decisions/009-compliance-prediction-model.md)
- [Pattern: Self-Suppressing Card Component](../knowledge/patterns/self-suppressing-card-component.md)
- [Pattern: Colocated Test Conventions](../knowledge/patterns/colocated-test-conventions.md)
- [Pattern: Actor-Serialized Upsert](../knowledge/patterns/actor-serialized-upsert.md)
- [Pattern: Controlled Component, Screen Owns State](../knowledge/patterns/controlled-component-screen-owns-state.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Active (already implemented)
