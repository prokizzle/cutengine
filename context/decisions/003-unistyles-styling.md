# Decision: Unistyles for Styling

## Context

The app is dark-only by design and needs a token system for colour, radius, type scale, and weight, consumed consistently across roughly seventeen components and seven screens. Styles must be assertable in tests, since some component behaviour is expressed purely as colour (a weight trend rendered green or red).

## Decision

`react-native-unistyles` v3, configured with a single theme named `dark` and a fixed initial theme.

The consumption pattern is uniform and narrow: every file declares one module-level stylesheet created from a factory that receives the theme, placed at the bottom of the file after the component. Components reference style keys; they do not call a styles hook or read the runtime.

Conditional appearance is expressed as a style array selecting between two fully-named static styles, or by indexing the stylesheet with a computed key. Inline style objects are used only for values derived from props at runtime.

Unistyles' own variants feature is not used anywhere.

Domain-semantic colours — the per-phase colours for cut, bulk, and maintenance — live in a domain utility module, not in the theme. Theme colours are role-based: positive, attention, warning, info.

The Babel plugin is configured with `components/` in its processed paths, which is what makes files in that directory eligible for the compile-time transform.

## Rationale

Unistyles gives themed tokens with a compile-time transform and no per-component hook call, which keeps components readable and avoids re-render coupling to a theme provider.

Keeping the consumption pattern narrow — one factory per file, styles at the bottom, arrays for conditionals — was chosen over using the library's full feature surface. It means every file looks the same, and a reader who has understood one component has understood all of them. The cost is verbosity where variants would be terser.

Separating role-based theme colours from domain-based phase colours is the meaningful split. `positive` means "this is good news" and could be any green; `PHASE_COLOR.bulk` identifies bulking specifically and must stay stable across the app regardless of what the theme does.

## Alternatives Considered

- **NativeWind with Tailwind CSS.** This was the original plan and is still what `CLAUDE.md` documents, including design tokens in a `global.css` that does not exist. The dependency was never added and no file uses `className`. See [Anti-pattern: Stale Stack Documentation](../knowledge/anti-patterns/stale-stack-documentation.md).
- **React Native's built-in StyleSheet with a hand-rolled theme object.** Would have worked, but with no typed theme augmentation and no test-time theme injection point.
- **Unistyles variants.** Available and deliberately unused; the two-named-styles idiom was preferred.

## Outcomes

Two consequences are worth tracking.

The test mock at `__mocks__/react-native-unistyles.ts` duplicates the entire token table verbatim so that style factories execute under Jest and tests can assert real colour values. **The token table therefore exists in two places and must be edited in both.** A change to a theme colour that is not mirrored into the mock will silently drift the style-asserting tests.

Some literals bypass tokens: card corner radii, micro-label font sizes, tab bar colours, macro bar segment colours, and several rgba tints are hardcoded at their use sites rather than added to the theme.

## Related

- [Project Intent](../intent/project-intent.md)
- [Decision: Tech Stack](001-tech-stack.md)
- [Pattern: Unistyles Themed Stylesheet](../knowledge/patterns/unistyles-themed-stylesheet.md)
- [Pattern: Component Folder Per Surface](../knowledge/patterns/component-folder-per-surface.md)
- [Anti-pattern: Stale Stack Documentation](../knowledge/anti-patterns/stale-stack-documentation.md)
- [Decision: Colocated Tests and Type-Check CI](016-colocated-tests-and-ci.md)
- [Pattern: Colocated Test Conventions](../knowledge/patterns/colocated-test-conventions.md)

## Status

- **Created**: 2026-08-13 (Phase: Intent)
- **Status**: Accepted
- **Note**: Documented from existing implementation. Supersedes the NativeWind approach described in `CLAUDE.md`, which was never implemented.
