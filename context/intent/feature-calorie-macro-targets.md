# Feature: Calorie and Macro Targets

## What

The Today screen shows the user how much to eat: a daily calorie number, and that number broken into grams of protein, carbohydrate, and fat, with a visual split bar.

The calorie target is derived from the user's current body weight and the rate of weight change they are targeting for their phase. A cut produces a number below maintenance; a bulk produces a number above it; maintenance produces the maintenance number itself.

The macro split defaults per phase and can be overridden by the user, and the grams shown always reflect whichever split is currently in effect.

When the app cannot compute a sensible target — no weight available, or a computed target at or below zero — it shows nothing rather than a placeholder number.

## Why

A daily calorie number is the single piece of information users open this kind of app to get. Everything else in the product exists to make that number correct and keep it correct.

Deriving the number from a target _rate_ rather than asking the user to pick a calorie figure is the point: users know they want to lose a pound a week, and they do not know what that means in calories. Recomputing from current weight means the number moves as they do, which is precisely the failure mode of setting a target once and never revisiting it.

Refusing to display a nonsense number matters more than it sounds. A visibly absent target prompts the user to log a weight; a fabricated one silently teaches them to eat wrong.

## Acceptance Criteria

- [x] A daily calorie target is shown when body weight is known
- [x] The target reflects the user's phase and target rate of change
- [x] A cut target is below maintenance, a bulk target above, maintenance equal
- [x] Maintenance ignores any leftover target rate from a previous phase
- [x] The target is broken into grams of protein, carbohydrate, and fat
- [x] Macro grams reflect the active split, including user overrides
- [x] A macro split bar visualizes the proportions
- [x] No target is displayed when body weight is unknown
- [x] A non-positive computed target is treated as no target rather than displayed

## Related

- [Project Intent](project-intent.md)
- [Feature: Phase Management](feature-phase-management.md)
- [Feature: Weight Tracking](feature-weight-tracking.md)
- [Decision: Thermodynamic Calorie Targets](../decisions/008-thermodynamic-calorie-targets.md)
- [Decision: HealthKit Is the Source of Truth for Body Measurements](../decisions/006-healthkit-weight-source-of-truth.md)
- [Pattern: Pure Domain Function With an Injected Clock](../knowledge/patterns/pure-domain-function-injected-clock.md)
- [Pattern: Null Means Insufficient Evidence](../knowledge/patterns/null-means-insufficient-evidence.md)
- [Feature: Meal Plan](feature-meal-plan.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Active (already implemented)
- **Note**: Total daily energy expenditure is currently a placeholder proportional to body weight, not a real expenditure estimate. The target arithmetic on top of it is complete and tested.
