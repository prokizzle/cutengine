# Pattern: Unistyles Themed Stylesheet

## Description

One module-level stylesheet per file, created from a factory that receives the theme, declared at the bottom of the file after the component. Conditional appearance is a style array selecting between fully-named static styles. Inline style objects appear only for values derived from props at runtime.

## When to Use

Every component and screen. This is the only styling pattern in the codebase.

## Pattern

- `const styles = StyleSheet.create((theme) => ({ ... }))` at the **bottom** of the file.
- Pass a no-argument factory when no token is needed.
- Reference tokens: `theme.colors.*`, `theme.radius.*`, `theme.fontSize.*`, `theme.fontWeight.*`.
- Conditional: `style={[styles.base, cond ? styles.a : styles.b]}` for either-or, `style={[styles.base, cond && styles.extra]}` for additive.
- For a value keyed by a domain union, index the stylesheet with a computed key.
- Inline objects only for runtime-derived values — an interpolated colour, an inset, an opacity.
- Unistyles' own variants feature is **not used**; do not introduce it without superseding the styling decision.

## Example

The factory and its placement:

```ts
const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: theme.radius.xl,
```
`components/timeline/MacroPill.tsx:23-32`

Either-or conditional over two named styles:

```tsx
<View style={[styles.checkbox, event.taken ? styles.checkboxTaken : styles.checkboxEmpty]}>
```
`components/timeline/DoseRow.tsx:17`

Additive conditional:

```tsx
style={[styles.selectorButton, selected && styles.selectorButtonSelected]}
```
`components/settings/PhaseSettings.tsx:179`

Indexing the stylesheet with a computed key, which is how per-domain-value styling is done:

```tsx
<View style={[styles.statusDot, styles[`statusDot_${status}` as const]]} />
```
`app/(tabs)/index.tsx:238`

with the keyed entries declared in the factory:

```ts
"statusDot_on-track": { backgroundColor: theme.colors.positive },
statusDot_watch: { backgroundColor: theme.colors.attention },
statusDot_action: { backgroundColor: theme.colors.warning },
statusDot_unknown: { backgroundColor: theme.colors.textTertiary },
```
`app/(tabs)/index.tsx:401-404`

Inline only for a prop-derived value:

```tsx
<View style={[styles.container, { backgroundColor: `${color}26` }]}>
```
`components/today/PhaseBadge.tsx:16`

## Two things to know before editing tokens

Theme colours currently exist in **three** places, and a change must be made in all of them or tests drift:

1. `unistyles.ts` — the real theme
2. `__mocks__/react-native-unistyles.ts` — a verbatim duplicate so style factories execute under Jest
3. `components/timeline/TimelineHero.test.tsx` — redeclares specific hex constants locally for style assertions

A new top-level directory containing styled files must be added to `autoProcessPaths` in `babel.config.js`, or the compile-time transform will not apply to it. Currently only `components/` is listed, with `app/` as the plugin root.

## Files Using This Pattern

Every file in `components/` and `app/`, with two exceptions:

- `components/paywall/NativePaywallWrapper.tsx` — inline `flex: 1` only, no stylesheet
- `app/customer-center.tsx` — inline styles and a hardcoded background colour; the only screen not on unistyles

Domain-semantic colours live outside the theme in `utils/phase.ts` as `PHASE_COLOR`. Theme colours are role-based; phase colours are domain-based.

## Related

- [Decision: Unistyles for Styling](../../decisions/003-unistyles-styling.md)
- [Decision: Tech Stack](../../decisions/001-tech-stack.md)
- [Pattern: Component Folder Per Surface](component-folder-per-surface.md)
- [Pattern: Colocated Test Conventions](colocated-test-conventions.md)
- [Anti-pattern: Stale Stack Documentation](../anti-patterns/stale-stack-documentation.md)

## Status

- **Created**: 2026-08-13
- **Status**: Active
