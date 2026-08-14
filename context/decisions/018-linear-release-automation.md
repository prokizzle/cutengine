# Decision: Linear Release Automation

## Context

Releases move through stages before shipping — code freeze, TestFlight, submitted — and the work in each release is tracked in Linear. Keeping the Linear release record in step with what has actually landed on the main branch is the kind of bookkeeping that is done inconsistently when done by hand.

Separately, App Store Connect operations — resolving the latest build, distributing to TestFlight groups, validating, staging a release, submitting for review — are multi-step sequences that are easy to get wrong under time pressure.

## Decision

Two pieces of automation, both declarative.

**A GitHub Actions workflow for the Linear release pipeline.** One workflow, two mutually exclusive jobs:

- Pushes to the main branch run a sync, attaching newly landed commits to the in-progress release
- Manual dispatch runs a release command, taking a version, an optional stage, and a choice of whether to update or complete the release

The workflow serializes: a concurrency group with cancellation disabled, so two release mutations never interleave. Checkout fetches full history, because commit scanning needs it.

TestFlight is modelled as a **stage on the single pipeline**, not as a separate pipeline.

**A declarative workflow file for the App Store Connect CLI**, defining named workflows composed of ordered steps. Steps capture named outputs from JSON responses and later steps interpolate them. Six workflows cover TestFlight distribution to groups, validation, staging a release, submitting for review, and status inspection.

Submitting for review is gated behind a boolean environment flag, currently off. The validation workflow invokes the repository's own pre-submit source scan before validating.

## Rationale

Serializing with cancellation disabled rather than letting runs cancel each other is the important detail. These jobs mutate an external system's state. A cancelled mutation leaves the release record in an unknown intermediate condition, which is worse than waiting.

Splitting push-driven sync from dispatch-driven release into one workflow with event guards keeps the two related behaviours in one file while making it impossible for a push to trigger a release transition.

Modelling TestFlight as a stage rather than a separate pipeline reflects what it is: a step a release passes through on the way to shipping, not a parallel track. The workflow header records this explicitly, along with the note that "scheduled" in this context refers to the Linear pipeline type — releases staged before shipping — and not a cron schedule. That clarification exists because the word invited exactly that misreading.

Gating review submission behind a flag that defaults off makes the single irreversible action in the pipeline opt-in. Everything else can be re-run; a review submission cannot be taken back.

Having the validation workflow call the repository's own pre-submit scan is what ties the distribution safety checks into the release path, rather than leaving them as a step someone is supposed to remember.

## Alternatives Considered

- **Manual Linear updates.** Rejected: done inconsistently, and the inconsistency is invisible until someone audits a release.
- **A cron-scheduled sync.** Rejected: pushes are the actual event, and polling would add latency for no benefit. The workflow has no schedule trigger at all.
- **A separate pipeline for TestFlight.** Rejected per the staging argument above.
- **Allowing concurrent runs to cancel each other.** Rejected: cancelling a mutation mid-flight is worse than queueing.
- **Submitting for review automatically.** Rejected: irreversible.

## Outcomes

Stage names in the workflow inputs must match the stages configured in the Linear workspace. That coupling is not verifiable from the repository, so a renamed stage in Linear breaks dispatch with no local signal.

App Store metadata under `metadata/` is versioned by release number and currently holds only a 1.0.1 directory while the app declares 2.0.0 — the metadata side of the release process has not kept pace with the version.

## Related

- [Project Intent](../intent/project-intent.md)
- [Feature: Dual Distribution](../intent/feature-dual-distribution.md)
- [Decision: Dual Distribution With Seed Stripping](012-dual-distribution-seed-stripping.md)
- [Decision: Colocated Tests and Type-Check CI](016-colocated-tests-and-ci.md)
- [Pattern: Defense in Depth on One Invariant](../knowledge/patterns/defense-in-depth-on-one-invariant.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Accepted
- **Note**: Documented from existing implementation.
