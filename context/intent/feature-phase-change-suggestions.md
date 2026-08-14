# Feature: Phase Change Suggestions

## What

The app watches the user's weight trend and tells them when the phase they are running has stopped doing what they intended. It recognises four situations:

- Cutting but gaining weight.
- Bulking but losing weight.
- Bulking with body fat rising faster than intended.
- A plateau: a target rate was set, and weight is not moving.

Each is delivered as a dismissible advisory card labelled as a trend insight. The app never switches phase on its own.

No suggestion is made during maintenance, because there is no intended direction to violate. No suggestion is made without enough weigh-ins to distinguish trend from noise.

## Why

Users are worse at noticing that a phase has quietly stopped working than at running the phase itself. Four weeks of a stalled cut looks, day to day, exactly like four weeks of a working cut — the daily numbers are identical and only the trend differs. This is the app watching for that on the user's behalf.

The four situations are the specific ways phases fail in practice, and each implies a different response, which is why they are named rather than collapsed into a generic "your trend looks off."

Keeping this advisory rather than automatic is a trust decision. Phase is the user's declared intent, and an app that reassigns intent based on two weeks of scale data would be wrong often enough to lose the user permanently. Suggesting costs nothing when wrong.

## Acceptance Criteria

- [x] A sustained gain while cutting produces a suggestion
- [x] A sustained loss while bulking produces a suggestion
- [x] Rising body fat while bulking produces a suggestion
- [x] A stalled trend against a non-zero target rate produces a plateau suggestion
- [x] No suggestion is produced during maintenance
- [x] No suggestion is produced without enough weigh-ins in each comparison window
- [x] Multiple weigh-ins on one day do not count as multiple data points
- [x] Suggestions are dismissible
- [x] Accepting a suggestion is never automatic — phase changes only by user action

## Related

- [Project Intent](project-intent.md)
- [Feature: Weight Tracking](feature-weight-tracking.md)
- [Feature: Phase Management](feature-phase-management.md)
- [Decision: Rolling-Average Trend Detection](../decisions/017-rolling-average-trend-detection.md)
- [Decision: HealthKit Is the Source of Truth for Weight](../decisions/006-healthkit-weight-source-of-truth.md)
- [Pattern: Pure Domain Function With an Injected Clock](../knowledge/patterns/pure-domain-function-injected-clock.md)
- [Pattern: Null Means Insufficient Evidence](../knowledge/patterns/null-means-insufficient-evidence.md)
- [Pattern: Named Thresholds With Recorded Rationale](../knowledge/patterns/named-thresholds-with-rationale.md)
- [Pattern: Self-Suppressing Card Component](../knowledge/patterns/self-suppressing-card-component.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Active (already implemented)
