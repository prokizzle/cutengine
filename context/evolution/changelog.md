# Changelog

## [Current State] - Context Mesh Added

Context Mesh was adopted retroactively on 2026-08-13, documenting a codebase that began on 2026-06-04 and had 39 commits at the time of adoption. Everything below describes what already existed; nothing here was built as part of the adoption.

### Existing Features (documented)

- **Onboarding** — three-step first-launch flow: welcome, phase selection, target rate. Runs once, gated on profile existence, with paid phases routing to the paywall.
- **Phase Management** — cut, bulk, or maintenance, each with a default macro split and target rate. Switching resets the phase clock. Bulk rates capped.
- **Calorie and Macro Targets** — daily calorie figure derived from target rate, split into macro grams. Expenditure itself is still a placeholder.
- **Weight Tracking** — read and write body weight through Apple Health, with a trailing seven-day rate coloured by phase intent.
- **Daily Check-In** — phase-specific one-to-five questionnaire, one entry per day, question wording snapshotted with each answer.
- **Compliance Risk Prediction** — predicts whether the user will skip today's check-in, via a three-tier ladder that scales with available history.
- **Phase Change Suggestions** — advisory nudges from a fourteen-day rolling-average weight trend, recognising four specific phase failures.
- **Protocol Entry** — plain-English dosing schedules parsed into structured rules entirely on device, with compound identity never exposed to the language model.
- **Subscription Access** — Pro entitlement gating bulk and maintenance, custom paywall, native subscription management.
- **App Updates** — over-the-air delivery with a five-state check outcome and a pending-update banner.
- **Dual Distribution** — App Store and sideload builds from one codebase, with the compound reference library bundled only in the latter.
- **Meal Plan** — placeholder UI only; the capability is not implemented.

### Tech Stack (documented)

- Bun, Expo SDK 56, React Native 0.85, React 19, new architecture enabled
- TypeScript 6.0 strict; `tsc --noEmit` is the lint gate
- Expo Router with typed routes
- react-native-unistyles for styling, single dark theme
- reselect for derived-value memoization
- Three local Swift Expo modules: cycle store (SwiftData in a shared App Group), HealthKit bridge, natural-language cycle parser
- RevenueCat for subscriptions, Sentry for error reporting, expo-updates for over-the-air delivery
- Jest with jest-expo and @testing-library/react-native
- iOS 17.0 deployment target; iOS is the only supported platform

### Patterns Identified

- Pure domain function with an injected clock
- Null means insufficient evidence
- Named thresholds with recorded rationale
- Native module behind a lib facade
- Capture before degrading
- Discriminated outcome instead of a boolean
- Immutable domain mutators
- Hook owns a slice and persists before setting state
- Selector composition chain
- Unistyles themed stylesheet
- Component folder per surface
- Self-suppressing card component
- Controlled component, screen owns state
- Colocated test conventions
- Seeded PRNG test fixture
- Actor-serialized upsert
- Bridge record round trip
- Variant-gated config plugin
- Defense in depth on one invariant

### Anti-patterns Recorded

- Negated asset bundle patterns — fails open on the one invariant that must not fail
- Onboarding gate that fails closed — turns a transient read error into permanent data loss
- Eager native module resolution — throws before platform guards can run
- Stale stack documentation — `CLAUDE.md` describes a styling layer that was never implemented

### Known Gaps Recorded During Adoption

These were found while documenting and are stated here so they are not rediscovered:

- **Total daily energy expenditure is a placeholder** proportional to body weight, ignoring height, age, sex, and activity. Every calorie number in the product rests on it. The `modules/expo-calorie-engine` directory referenced in `CLAUDE.md` has no source.
- **The test suite does not run in continuous integration.** CI installs, type-checks, and greps the packaging plugin. A broken test can be merged.
- **No screen under `app/` has any test** — including the onboarding gate and the Today screen's derivation logic.
- **`CLAUDE.md` documents NativeWind and Tailwind**, which are not present. The implemented styling layer is unistyles. Reanimated is installed and unused.
- **Theme colours exist in three places** — `unistyles.ts`, the Jest mock that duplicates it, and one test that redeclares hex constants locally.
- **The seed-stripping plugin has a hand-maintained CommonJS twin** that must be kept in sync manually; CI inspects only the TypeScript file.
- **The two pre-submission scanners use different banned-term lists**, with no record of whether the divergence is intentional.
- **The parser native module resolves eagerly** and is consumed directly by a screen with no platform guard, unlike the other two modules.
- **The timeline UI is fully built and tested but reachable from no screen.** Same for the hosted-paywall wrapper and the phase badge.
- **The persistence layer is broader than the UI** — compounds, schedules, dose rules, and meal rules are implemented natively and unused by the app.
- **Several Settings rows are placeholder alerts**: height, date of birth, sex, unit preferences, export, reset.
- **App Store metadata is versioned only up to 1.0.1** while the app declares 2.0.0.
- **`app/customer-center.tsx` is the one screen not on unistyles**, using inline styles and a hardcoded colour.
- **The RevenueCat wrapper's entitlement check swallows errors without reporting**, breaking the capture-before-degrading convention used elsewhere.
- **Two secret-bearing files sit untracked in the working tree** and are not matched by any `.gitignore` rule: `credentials.json` (containing an inline certificate password) and `play-store-service-account.json`. Nothing is committed, but `git add -A` would stage them.

---
*Context Mesh added: 2026-08-13*
*This changelog documents the state when Context Mesh was added.*
*Future changes will be tracked below.*
