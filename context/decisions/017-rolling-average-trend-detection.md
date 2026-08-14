# Decision: Rolling-Average Trend Detection

## Context

Two features need to know whether the user's weight is actually moving: the Today screen's weekly rate display, and the phase-change suggestion engine. Daily body weight is dominated by water, food volume, and time of day. A naive slope over raw weigh-ins reports large movement that is not real.

## Decision

Compare two adjacent fourteen-day rolling averages, with explicit sufficiency gates.

- Collapse to one weigh-in per calendar day, keeping the most recent that day
- Average the fourteen days before that, and the fourteen days before those
- The difference between the two averages, halved, is the rate per week
- Return nothing unless **both** windows contain at least three days with data
- Two named thresholds classify the result: below one magnitude reads as a plateau, above the other reads as sustained movement, and the band between is treated as neither
- The Today screen's own seven-day display anchors its window to the present moment rather than to the last weigh-in, and returns nothing with fewer than two samples in that window
- Suggestions are suppressed entirely during maintenance, and a plateau is only reported when a non-zero target rate was actually set

## Rationale

Two adjacent averages rather than a fitted slope because it is robust and explainable. A user can be told "your average over the last two weeks is 0.4 kg below the two weeks before" and verify it. A regression coefficient is neither.

Fourteen days per window is long enough that a single salty meal or a dehydrated morning cannot move the average meaningfully, and short enough that a genuine four-week stall is detected while the user can still act on it.

Collapsing to one weigh-in per day matters more than it appears. A user who steps on the scale three times one morning would otherwise contribute three samples to that window and triple-weight a single day — and people who weigh repeatedly tend to do it on days their weight surprises them, which biases exactly the wrong direction.

Requiring three days per window is the sufficiency gate. Two windows with one sample each produce a difference that is pure noise but looks exactly like a trend. Returning nothing is the correct answer, and it is why this returns an absent value rather than zero.

Separating the plateau threshold from the sustained-movement threshold, with a dead band between, prevents a user hovering near the boundary from being told alternating contradictory things day to day.

Anchoring the Today screen's short window to the present rather than to the last weigh-in prevents a stale rate: a user who stopped weighing three weeks ago should see nothing, not a confidently-reported rate from three weeks ago.

Suppressing suggestions during maintenance follows from what a suggestion means. Maintenance has no intended direction, so there is no way to violate it. A plateau claim requires a target that is being missed, which is why it is gated on a non-zero rate.

## Alternatives Considered

- **Linear regression over the window.** More statistically conventional and less explainable to a user; no evidence it would classify differently at these window lengths.
- **An exponentially weighted moving average.** A common approach for scale weight, and a reasonable alternative. Two flat windows were preferred for the same explainability reason, and because the two-window form makes the sufficiency gate trivial to express per side.
- **A single threshold.** Rejected: produces day-to-day flapping for users near the boundary.
- **Reporting zero when there is insufficient data.** Rejected: zero means "not moving," which is a claim. Absence means "we do not know."
- **Counting every weigh-in.** Rejected per the repeated-weighing bias.

## Outcomes

The thresholds are heuristic and are recorded as such in the source, each with a comment explaining what it distinguishes. They have not been validated against real user outcomes — they are informed guesses, and the code says so rather than presenting them as derived.

## Related

- [Project Intent](../intent/project-intent.md)
- [Feature: Phase Change Suggestions](../intent/feature-phase-change-suggestions.md)
- [Feature: Weight Tracking](../intent/feature-weight-tracking.md)
- [Decision: HealthKit Is the Source of Truth for Weight](006-healthkit-weight-source-of-truth.md)
- [Decision: Singleton Flat Phase Profile](007-singleton-flat-phase-profile.md)
- [Pattern: Pure Domain Function With an Injected Clock](../knowledge/patterns/pure-domain-function-injected-clock.md)
- [Pattern: Null Means Insufficient Evidence](../knowledge/patterns/null-means-insufficient-evidence.md)
- [Pattern: Named Thresholds With Recorded Rationale](../knowledge/patterns/named-thresholds-with-rationale.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Accepted
- **Note**: Documented from existing implementation.
