# Decision: Thermodynamic Calorie Targets

## Context

The app must turn a user's target rate of weight change into a daily calorie number. There are two established approaches: predict the user's expenditure from their body metrics with a published equation, or work backwards from the desired rate of change using the energy content of body tissue.

## Decision

Work backwards from the target rate, using a fixed energy-per-kilogram constant.

- Daily target equals estimated expenditure plus the target weekly change converted to a daily energy adjustment, using a constant for the energy content of a kilogram of body mass
- Maintenance returns the expenditure estimate exactly, ignoring whatever target rate is stored — so a leftover rate from a previous phase cannot leak into a maintenance target
- Four named rate tiers per direction, expressed in pounds per week so they match how users think, converted internally
- Bulk rates are capped, with a lower cap for unenhanced users and a higher one otherwise. Cut rates are not capped
- Macro grams are derived from the calorie target and the active split, using four calories per gram for protein and carbohydrate and nine for fat
- A non-positive computed target is treated as absent rather than displayed

**Expenditure itself is currently a placeholder**: body weight multiplied by a flat per-kilogram constant, computed in the Today screen. This is not a published equation and is acknowledged in this document as unfinished work.

## Rationale

The energy-per-kilogram approach was chosen because it directly expresses what the user asked for. A user who selects "lose one pound per week" gets a number that, if followed, produces that rate — the causal chain from their choice to the number on screen is one step, and it is explainable to them.

Ignoring the stored rate during maintenance rather than requiring it to be zero is a small decision with real consequence: a user who cuts, sets an aggressive deficit, then switches to maintenance would otherwise carry the deficit into a phase that is supposed to hold weight steady.

Capping bulk rates but not cut rates reflects an asymmetry in the failure modes. An overly aggressive surplus produces fat gain the user did not want and cannot undo quickly; an aggressive cut is uncomfortable but self-limiting, and users abandon it on their own.

Presenting tiers in pounds per week while computing in kilograms matches user vocabulary without carrying imperial units through the calculation.

Refusing to display a non-positive target is the honest response to a nonsense input, and it prompts the user to fix the cause — usually a missing weight.

## Alternatives Considered

- **Mifflin-St Jeor or Harris-Benedict for expenditure.** Not implemented. These are the standard predictive equations and would replace the placeholder — but they require height, age, sex, and an activity multiplier, and the Settings rows for height, date of birth, and sex are still stubs. This is the sequencing reason the placeholder exists.
- **Asking the user for their own calorie target directly.** Rejected: users do not know it, and it does not update as they change.
- **Adaptive expenditure estimation from observed weight change against logged intake.** Would be more accurate than any equation, and requires intake logging the app does not have.
- **Capping cut rates too.** Rejected per the asymmetry above.

## Outcomes

The target arithmetic is complete, tested, and correct given an expenditure figure. The expenditure figure itself is the open item, and it is the single largest correctness gap in the product: every calorie number shown to a user is currently derived from body weight alone, ignoring height, age, sex, and activity.

The directory referenced in `CLAUDE.md` as `modules/expo-calorie-engine` does not contain a source directory. Whatever was planned there was not built.

## Related

- [Project Intent](../intent/project-intent.md)
- [Feature: Calorie and Macro Targets](../intent/feature-calorie-macro-targets.md)
- [Feature: Phase Management](../intent/feature-phase-management.md)
- [Decision: Singleton Flat Phase Profile](007-singleton-flat-phase-profile.md)
- [Decision: HealthKit Is the Source of Truth for Body Measurements](006-healthkit-weight-source-of-truth.md)
- [Pattern: Named Thresholds With Recorded Rationale](../knowledge/patterns/named-thresholds-with-rationale.md)
- [Pattern: Null Means Insufficient Evidence](../knowledge/patterns/null-means-insufficient-evidence.md)
- [Anti-pattern: Stale Stack Documentation](../knowledge/anti-patterns/stale-stack-documentation.md)
- [Pattern: Pure Domain Function With an Injected Clock](../knowledge/patterns/pure-domain-function-injected-clock.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Accepted, with a known gap in expenditure estimation
- **Note**: Documented from existing implementation.
