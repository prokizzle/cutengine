# Feature: Meal Plan

## What

A tab showing the day's eating schedule as a sequence of time blocks, each listing what to eat at that time.

As currently built this is a static mockup. Four time blocks with fixed food strings are displayed; nothing is derived from the user's calorie or macro targets, nothing is editable, and nothing is saved.

## Why

The intended capability is turning a calorie and macro target into an actual day of eating. A target of 2,150 calories at a given macro split is arithmetic the user still has to translate into meals, and that translation is where adherence is won or lost. Users who know their numbers and still fail usually fail at three in the afternoon with no plan for dinner.

The placeholder exists because the surface was worth reserving in the navigation before the capability was built — the tab shape and the time-block presentation are the intended structure, filled with example content.

## Acceptance Criteria

Currently met:

- [x] A meal tab is reachable from the main navigation
- [x] The day is presented as an ordered sequence of time blocks
- [x] Each block lists its items

Not yet met — the intended capability:

- [ ] Meals are derived from the user's calorie and macro targets
- [ ] The user can edit, add, and remove meals
- [ ] Meals persist across launches
- [ ] Per-meal macro contributions are shown
- [ ] The plan reflects the user's current phase

## Related

- [Project Intent](project-intent.md)
- [Feature: Calorie and Macro Targets](feature-calorie-macro-targets.md)
- [Decision: SwiftData in a Shared App Group](../decisions/005-swiftdata-app-group-persistence.md)
- [Pattern: Actor-Serialized Upsert](../knowledge/patterns/actor-serialized-upsert.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Planned — placeholder UI shipped, capability not implemented
- **Note**: The persistence layer already supports meal rules and meal items, including ordering; no application code reads or writes them.
