# Feature: Body Composition Input

## What

CutEngine uses body-fat readings already present in Apple Health as the automatic input for its body-composition signal. It reads the newest available reading and a trailing history without asking the user to maintain a second copy inside the app.

This first slice establishes the read path only. Manual Navy tape, caliper, and DEXA entry, calibration, trend interpretation, and user interface work remain planned separately.

When no reading is available, the app exposes an absent result rather than inventing a body-fat value. Apple Health does not reveal whether an empty read means no samples or denied read access, so the app does not claim to distinguish those cases.

## Why

Smart scales already write body-fat readings to Apple Health. Reusing that history makes the product useful without setup and lets future trend features start with existing data rather than waiting weeks for in-app entries.

Body-fat estimates from consumer devices can be biased, but the product uses change over time rather than presenting an absolute percentage as its main signal. A consistent source is therefore useful even when its absolute value is imperfect.

## Acceptance Criteria

- [x] Body-fat read access is included in the existing lazy Health authorization request
- [x] The newest accessible body-fat reading can be retrieved with its date
- [x] A trailing body-fat history can be retrieved in chronological order
- [x] An unavailable newest reading is represented as absent, not zero
- [x] Body-fat values remain owned by Apple Health and are not copied into app persistence
- [x] Empty reads are not described as confirmed permission denial or a confirmed empty Health store
- [x] Manual entry, calibration, trend interpretation, and body-composition UI remain outside this slice

## Related

- [Project Intent](project-intent.md)
- [Feature: Weight Tracking](feature-weight-tracking.md)
- [Decision: HealthKit Is the Source of Truth for Body Measurements](../decisions/006-healthkit-weight-source-of-truth.md)
- [Decision: Local Swift Expo Modules](../decisions/004-local-swift-expo-modules.md)
- [Pattern: Native Module Behind a lib Facade](../knowledge/patterns/native-module-behind-lib-facade.md)
- [Pattern: Bridge Record Round Trip](../knowledge/patterns/bridge-record-round-trip.md)
- [Pattern: Null Means Insufficient Evidence](../knowledge/patterns/null-means-insufficient-evidence.md)

## Status

- **Created**: 2026-08-17 (Phase: Intent)
- **Status**: Active
- **Note**: The HealthKit read foundation is tracked by BOD-50; later roadmap slices add manual methods, calibration, trends, and UI.
