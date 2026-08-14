# Feature: App Updates

## What

The app can update itself without going through the App Store. On launch it checks for a new version in the background. When one has been downloaded and is ready, a banner appears at the top of the screen; tapping it restarts the app on the new version.

From Settings the user can check manually, and gets a distinct message for each outcome: no update available, one downloaded and ready, one already waiting, updates disabled in this build, or the check failed.

Settings also shows which release channel the build is on and a short identifier for the running version, so a specific user's build can be identified during support.

## Why

The product ships two distributions and iterates quickly. Waiting on App Store review to correct a wrong calorie number or a crash on a specific device is not acceptable when the fix is JavaScript.

Distinguishing all five check outcomes rather than reporting success or failure is the substantive part. "No update available" and "the check failed" look identical to a user if both are reported as up-to-date, and the second one silently means the user is stranded on a broken version believing they are current.

Surfacing the channel and version identifier exists for support: the first thing to establish when a user reports something impossible is which build they are actually running.

## Acceptance Criteria

- [x] An update check runs in the background at launch
- [x] A banner appears when an update is downloaded and ready to apply
- [x] Tapping the banner restarts the app on the new version
- [x] The banner does not overlap system UI
- [x] The user can check for updates manually from Settings
- [x] Each check outcome produces a distinct message, including failure
- [x] A failed check is never reported as up-to-date
- [x] The release channel and a version identifier are visible in Settings
- [x] Update failures are reported for diagnosis

## Related

- [Project Intent](project-intent.md)
- [Feature: Dual Distribution](feature-dual-distribution.md)
- [Decision: Over-the-Air Updates With Fingerprint Runtime Versioning](../decisions/014-expo-updates-ota.md)
- [Decision: Sentry for Error Reporting](../decisions/013-sentry-error-reporting.md)
- [Pattern: Discriminated Outcome Instead of a Boolean](../knowledge/patterns/discriminated-outcome-instead-of-boolean.md)
- [Decision: Dual Distribution With Seed Stripping](../decisions/012-dual-distribution-seed-stripping.md)
- [Pattern: Capture Before Degrading](../knowledge/patterns/capture-before-degrading.md)
- [Pattern: Self-Suppressing Card Component](../knowledge/patterns/self-suppressing-card-component.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Active (already implemented)
