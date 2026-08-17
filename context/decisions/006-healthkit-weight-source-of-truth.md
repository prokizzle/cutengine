# Decision: HealthKit Is the Source of Truth for Body Measurements

## Context

Body weight drives the calorie target and existing trend judgments. Body-fat history will drive the body-composition signal. Both are data the user may already have from a scale, another app, or the Health app itself. The app needed to decide whether to keep its own copies.

## Decision

Apple Health owns body weight and body-fat measurements. The app's own persistence layer contains neither measurement.

- The user profile stores phase, phase start date, macro overrides, and a target rate of change — and no weight
- Latest weight is read from Health on demand
- Weight history is read from Health for trend computation, over a trailing window of roughly two months
- Weights the user enters in the app are written to Health
- Latest body fat and body-fat history are read from Health on demand
- Body-fat percentages cross the bridge as fractions, matching HealthKit's percent unit
- Authorization is requested lazily on first use and memoized for the process
- Requesting read access covers body mass, body-fat percentage, active energy, and step count; write access covers body mass only in the current slice

The constraint is stated in the Swift source in two places, so that a future contributor adding a weight column to the store encounters it.

## Rationale

A second copy of a body measurement is a synchronization problem with no upside. The scale writes to Health; if the app kept its own copy, it would be stale the moment the user stepped on the scale without opening the app — which is the normal case.

Reading history rather than accumulating it means trend features can work on day one for a user with existing measurements, instead of requiring weeks of in-app logging before the app has anything to say.

Writing back means users who do log manually in the app are not creating data trapped inside it.

Lazy authorization means a user who never opens the weight widget is never asked for Health access, and memoizing it means they are asked once.

Requesting more read types than are currently used — active energy and step count alongside body mass — front-loads the permission prompt for expenditure estimation, which is the obvious next thing the app needs and which would otherwise require a second prompt later.

## Alternatives Considered

- **Store weight in the app's own SwiftData container.** Rejected: creates a second copy that goes stale, for no benefit.
- **Store body-fat readings in the app's own SwiftData container.** Rejected for the same reason: Health already owns smart-scale history, and future manual readings will be written there too.
- **Ask the user to type their weight with no Health integration.** Rejected: forfeits existing history and adds daily friction to the app's most important input.
- **Request authorization at launch.** Rejected in favour of lazy request, so the prompt arrives in context.
- **Use the `expo-health` package.** It is a declared dependency and is never imported. The local Swift bridge was written instead, which allows requesting exactly these types and reporting unavailability as a false return rather than a throw.

## Outcomes

Authorization returns false rather than throwing when Health data is unavailable on the device, so callers get a clean "not ready" state instead of an exception.

Active energy is readable through the bridge and is not used by any screen. The daily target still uses a placeholder proportional to body weight rather than a real expenditure estimate — the permission is in place for the work that would replace it.

The BOD-49 premise spike found 7,826 accessible body-fat samples from five sources spanning 2015 through 2026. That evidence kept Apple Health as the zero-configuration default. BOD-50 extends the existing read path with latest and trailing-history body-fat queries; manual methods and calibration remain future work.

## Related

- [Project Intent](../intent/project-intent.md)
- [Feature: Weight Tracking](../intent/feature-weight-tracking.md)
- [Feature: Body Composition Input](../intent/feature-body-composition-input.md)
- [Feature: Calorie and Macro Targets](../intent/feature-calorie-macro-targets.md)
- [Feature: Phase Change Suggestions](../intent/feature-phase-change-suggestions.md)
- [Decision: Local Swift Expo Modules](004-local-swift-expo-modules.md)
- [Decision: SwiftData in a Shared App Group](005-swiftdata-app-group-persistence.md)
- [Decision: Thermodynamic Calorie Targets](008-thermodynamic-calorie-targets.md)
- [Pattern: Native Module Behind a lib Facade](../knowledge/patterns/native-module-behind-lib-facade.md)
- [Decision: Singleton Flat Phase Profile](007-singleton-flat-phase-profile.md)
- [Decision: Rolling-Average Trend Detection](017-rolling-average-trend-detection.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Accepted
- **Note**: Documented from existing implementation; expanded to body-fat measurements on 2026-08-17 after BOD-49 validated the input premise.
