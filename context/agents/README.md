# Agents

Reusable role definitions for recurring work in this repository. Each file is a prompt an agent adopts wholesale, scoped narrowly enough that it can be relied on.

## Available Roles

- [Agent: Distribution Safety Reviewer](distribution-safety-reviewer.md) — reviews a change for whether it can leak the compound reference library into an App Store or TestFlight build. Reports only; never fixes.
- [Agent: Compliance Model Evaluator](compliance-model-evaluator.md) — evaluates a change to the compliance prediction system against the published baseline, guarding specifically against accuracy gains that come from predicting fewer misses.

## Writing a New Role

Add one when a task recurs often enough that the framing is worth committing rather than reconstructed each time.

Keep the scope narrow. A role that answers one question and frequently answers "no impact" is more useful than a broad reviewer, because its silence is informative. Both existing roles are built that way.

Every role should state:

- **Purpose** — the one question it answers, and explicitly what it does not review
- **When to Dispatch** — concrete file paths and events, not categories
- **Required Reading** — the decisions and patterns to load first
- **Checklist** — every item reported as pass, fail, or not applicable, never skipped silently
- **Output Format** — a single verdict line, then evidence
- **Constraints** — particularly what the role must not do to make something pass

Do not put here what belongs in a decision, a pattern, or a feature file. See `../.context-mesh-framework.md` for the separation rules.

## Status

- **Created**: 2026-08-13
- **Status**: Active
