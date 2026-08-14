# Decision: Tech Stack

## Context

CutEngine 2.0 is a rewrite. The predecessor is a native iOS app living in the `bodyengine-ios` Tuist monorepo alongside CardioEngine. The rewrite needed to keep the parts of the product that genuinely require native iOS — HealthKit, SwiftData persistence shared with CardioEngine, and an on-device language model — while moving the screens to something that iterates faster than a native build-and-submit cycle.

## Decision

React Native under Expo, with native capability supplied by locally authored Swift modules.

Runtime and tooling:

- **Bun** as package manager and script runner
- **Expo SDK 56** with **React Native 0.85** and **React 19**, new architecture enabled
- **TypeScript 6.0** in strict mode; `tsc --noEmit` is the lint gate
- **Jest** with the `jest-expo` preset and `@testing-library/react-native` for tests
- **Prettier** for formatting, with no committed configuration and no ESLint

Application layers:

- **Expo Router** for navigation, with typed routes enabled
- **react-native-unistyles** for styling
- **reselect** for derived-value memoization
- **react-native-purchases** for subscriptions
- **@sentry/react-native** for error reporting
- **expo-updates** for over-the-air delivery
- Three local Expo native modules in Swift: cycle store, HealthKit bridge, natural-language cycle parser

iOS deployment target 17.0. iOS is the only supported platform; all three native modules declare iOS only, and the JavaScript layer degrades to neutral values elsewhere.

## Rationale

Expo was chosen over bare React Native for the config-plugin system and the managed build pipeline, both of which this project leans on heavily — the dual-distribution mechanism is a config plugin, and the build profiles are EAS profiles.

Expo was chosen over staying native because the screens are where iteration happens and the native surface is small and stable. Three modules cover everything that genuinely needs Swift; the rest is layout and arithmetic that does not benefit from being compiled.

Bun over npm or Yarn for install and script speed; the lockfile is committed and continuous integration installs with a frozen lockfile.

TypeScript strict with `tsc --noEmit` as the only lint gate is a deliberate minimum: one gate that catches real defects, rather than a linter configuration to argue about. There is no ESLint and no Prettier configuration, which is a real gap — formatting is enforced only by whoever remembers to run it.

Sentry is pinned outside Expo's dependency management (`expo.install.exclude`) so the SDK version is chosen deliberately rather than moved by an Expo upgrade.

## Alternatives Considered

- **Staying fully native (Tuist, SwiftUI).** Rejected: the predecessor was this, and screen iteration was the bottleneck. The monorepo remains for CardioEngine.
- **Flutter.** Not evidenced in the codebase. Would have forfeited the shared SwiftData container with CardioEngine and the Expo config-plugin mechanism the distribution split depends on.
- **Bare React Native.** Would have required hand-building the equivalent of the config plugin and the build profiles.
- **NativeWind with Tailwind.** This appears to have been the original intent — `CLAUDE.md` still documents it — but the implemented styling layer is unistyles. See [Decision: Unistyles for Styling](003-unistyles-styling.md) and [Anti-pattern: Stale Stack Documentation](../knowledge/anti-patterns/stale-stack-documentation.md).

## Outcomes

Two dependencies are declared and unused, which is worth resolving one way or the other:

- `react-native-reanimated` and `react-native-worklets` are installed and the worklets Babel plugin is configured, but no source file uses either. There is no animation in the app.
- `expo-health` is a declared dependency with no imports anywhere; HealthKit access goes through the local Swift module instead.

The single-gate lint decision has held up for type safety and left formatting unenforced.

## Related

- [Project Intent](../intent/project-intent.md)
- [Decision: Expo Router File-Based Routing](002-expo-router-file-based-routing.md)
- [Decision: Unistyles for Styling](003-unistyles-styling.md)
- [Decision: Local Swift Expo Modules](004-local-swift-expo-modules.md)
- [Decision: No Global State Store](015-no-global-state-store.md)
- [Decision: Colocated Tests and Type-Check CI](016-colocated-tests-and-ci.md)
- [Anti-pattern: Stale Stack Documentation](../knowledge/anti-patterns/stale-stack-documentation.md)
- [Decision: RevenueCat Entitlement Gating](011-revenuecat-entitlement-gating.md)
- [Decision: Dual Distribution With Seed Stripping](012-dual-distribution-seed-stripping.md)
- [Decision: Sentry for Error Reporting](013-sentry-error-reporting.md)
- [Decision: Over-the-Air Updates With Fingerprint Runtime Versioning](014-expo-updates-ota.md)
- [Pattern: Selector Composition Chain](../knowledge/patterns/selector-composition-chain.md)
- [Pattern: Unistyles Themed Stylesheet](../knowledge/patterns/unistyles-themed-stylesheet.md)
- [Pattern: Variant-Gated Config Plugin](../knowledge/patterns/variant-gated-config-plugin.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Accepted
- **Note**: Documented from existing implementation.
