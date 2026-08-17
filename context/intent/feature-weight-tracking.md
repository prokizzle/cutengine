# Feature: Weight Tracking

## What

The user logs their body weight from the Today screen: a single number field and a Log button. Weight is read from and written to Apple Health, so it stays in sync with the scale, the Health app, and every other app the user already trusts with it.

The app reads the most recent weight to drive the calorie target, and reads roughly two months of history to compute trends.

The Today screen shows a trailing seven-day rate of change in pounds per week, coloured according to whether that movement is what the user's phase wants. Losing during a cut reads as good; losing during a bulk reads as a problem. Maintenance treats a small band around zero as neutral.

A rate is only shown when there are at least two weigh-ins inside the seven-day window. Fewer than that and the app shows nothing.

Health access is requested lazily, and the widget indicates whether it is ready. Invalid input and write failures are reported to the user rather than swallowed.

## Why

Body weight is the input the whole product runs on, and asking users to maintain a second private copy of it is how tracking apps get abandoned. Apple Health is already where their scale writes, so reading from it means the app works on day one with no data entry, and writing to it means users who do log manually are not stranded inside one app.

Showing a trailing weekly rate rather than today's number is the substantive choice. A single weigh-in is mostly water; a week of them is a trend. Colouring that trend by phase intent is what turns a number into feedback.

Suppressing the rate below two samples avoids the worst failure of trend display: extrapolating a slope from noise and telling a user they are gaining four pounds a week when they had a salty dinner.

## Acceptance Criteria

- [x] The user can enter and save a body weight from the Today screen
- [x] Saved weights are written to Apple Health
- [x] The most recent weight is read from Apple Health and drives the calorie target
- [x] Weight history is read for trend computation
- [x] A trailing seven-day rate of change is displayed in pounds per week
- [x] The rate is coloured by whether the movement matches the phase's intent
- [x] Maintenance treats small movement in either direction as neutral
- [x] No rate is shown when fewer than two weigh-ins fall inside the window
- [x] The widget indicates whether Health access is ready
- [x] Non-numeric or non-positive input is rejected with a message
- [x] A failed write is reported to the user
- [x] A successful write refreshes the displayed history

## Related

- [Project Intent](project-intent.md)
- [Feature: Calorie and Macro Targets](feature-calorie-macro-targets.md)
- [Feature: Phase Change Suggestions](feature-phase-change-suggestions.md)
- [Decision: HealthKit Is the Source of Truth for Body Measurements](../decisions/006-healthkit-weight-source-of-truth.md)
- [Decision: Local Swift Expo Modules](../decisions/004-local-swift-expo-modules.md)
- [Pattern: Native Module Behind a lib Facade](../knowledge/patterns/native-module-behind-lib-facade.md)
- [Pattern: Null Means Insufficient Evidence](../knowledge/patterns/null-means-insufficient-evidence.md)
- [Decision: Rolling-Average Trend Detection](../decisions/017-rolling-average-trend-detection.md)
- [Pattern: Bridge Record Round Trip](../knowledge/patterns/bridge-record-round-trip.md)
- [Pattern: Controlled Component, Screen Owns State](../knowledge/patterns/controlled-component-screen-owns-state.md)
- [Pattern: Hook Owns a Slice and Persists Before Setting State](../knowledge/patterns/hook-persist-then-set-state.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Active (already implemented)
