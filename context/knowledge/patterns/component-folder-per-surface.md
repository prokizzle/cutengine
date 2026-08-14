# Pattern: Component Folder Per Surface

## Description

`components/` is organized by the app surface each component serves, mirroring the route that consumes it. Genuinely cross-surface components sit at the root of `components/`. There are no barrel files and no path aliases — everything is imported by full relative path.

## When to Use

Every component. When adding one, put it in the folder for the screen that uses it; promote to the root of `components/` only when a second surface consumes it.

## Pattern

- One folder per surface: `today/`, `timeline/`, `settings/`, `paywall/`, each mirroring a route.
- Cross-surface components at `components/` root.
- File name in PascalCase, matching the exported component name exactly.
- Tests colocated as `<Component>.test.tsx` in the same folder.
- **Named exports only.** `export default` is reserved for Expo Router route files, which require it.
- Props as a local, unexported `type Props = { ... }` — never an interface, never `React.FC`.
- File-private sub-components declared in the same file with their prop type inline at the parameter position.
- Module-level constants for copy tables, option lists, and formatter instances, hoisted above the component so they are constructed once.
- Screens own scrolling; components render plain view trees mapped with `.map()`. No `FlatList` or `SectionList` anywhere.

## Example

The prop-type convention, with mixed value and type imports:

```ts
import {
  DEFAULT_MACROS, macroRatioFor,
  type MacroRatio, type Phase, type UserProfile,
} from "../../modules/expo-cycle-store/src/userProfile";
```
`components/settings/PhaseSettings.tsx:4-11`

Import by full relative path — no barrels, no aliases:

```ts
import { CheckInCard } from "../../components/today/CheckInCard";
```

The divider-between-items idiom used instead of a list separator prop:

```tsx
{items.map((event, index) => (
  <View key={event.id}>
    {index > 0 && <View style={styles.divider} />}
    <DoseRow event={event} />
  </View>
))}
```
`components/timeline/BucketSection.tsx:17-22`

Accessibility labels are on every interactive element, phrased as an action or identity, and they double as the primary test selector — which is why gating state is encoded into the label rather than only into a disabled prop:

```tsx
accessibilityLabel={`${PHASE_LABEL[option]} phase${locked ? ", requires Pro" : ""}`}
```
`components/settings/PhaseSettings.tsx:180`

A file-private sub-component is remounted to reset its internal state, rather than syncing it with an effect:

```tsx
// components/settings/PhaseSettings.tsx:222 — key={phase} resets MacroSplitEditor's useState
```

## Files Using This Pattern

- `components/UpdateBanner.tsx` — cross-surface, root level
- `components/today/` — `CheckInCard`, `ComplianceRiskCard`, `HealthKitWidget`, `PhaseBadge`, `PhaseSuggestionCard`
- `components/timeline/` — `TimelineHero`, `TimelineSpine`, `BucketSection`, `DoseRow`, `MacroTargets`, `MacroPill`
- `components/settings/` — `PhaseSettings`
- `components/paywall/` — `PaywallHeader`, `PackageCard`, `PaywallFooter`, `NativePaywallWrapper`

Note: `accessibilityLabel` is used throughout, but `accessibilityRole`, `accessibilityState`, and `accessibilityHint` are absent everywhere. Screen-reader users get names without roles or state.

## Related

- [Decision: Unistyles for Styling](../../decisions/003-unistyles-styling.md)
- [Decision: Expo Router File-Based Routing](../../decisions/002-expo-router-file-based-routing.md)
- [Decision: Colocated Tests and Type-Check CI](../../decisions/016-colocated-tests-and-ci.md)
- [Pattern: Unistyles Themed Stylesheet](unistyles-themed-stylesheet.md)
- [Pattern: Self-Suppressing Card Component](self-suppressing-card-component.md)
- [Pattern: Controlled Component, Screen Owns State](controlled-component-screen-owns-state.md)
- [Pattern: Colocated Test Conventions](colocated-test-conventions.md)

## Status

- **Created**: 2026-08-13
- **Status**: Active
