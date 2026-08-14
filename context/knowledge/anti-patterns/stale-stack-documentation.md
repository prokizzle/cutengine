# Anti-pattern: Stale Stack Documentation

## What Not To Do

Do not leave a planned technical approach documented as though it were the implemented one. When the plan changes, change the document in the same commit, or record the change as a decision.

## What Breaks

`CLAUDE.md` currently describes the styling layer as:

> **Styling:** NativeWind v4 + Tailwind CSS v4 (design tokens in `global.css`)

None of that is true. There is no `nativewind` dependency, no `tailwind` dependency, no `global.css`, and no `className` attribute in any source file. The implemented styling layer is `react-native-unistyles`, configured in `unistyles.ts`, consumed through themed stylesheet factories in every component.

The same file lists Reanimated v4 as the animation layer. It is installed, the worklets Babel plugin is configured, and no source file uses it. There is no animation in the app.

What breaks is agent and contributor behaviour, and it breaks in the most expensive direction. `CLAUDE.md` is loaded automatically into every session. An agent told the project uses Tailwind will write `className` attributes that silently do nothing — no type error, no runtime error, just unstyled output. It will look for `global.css` and, not finding it, may create one. It will reach for Reanimated for a transition rather than following the codebase's actual approach.

A wrong instruction that is loaded by default is worse than no instruction, because the reader has no reason to doubt it.

## How It Was Caught

By reading the dependency manifest against the documentation during this Context Mesh adoption. Two independent analyses of the codebase flagged the same mismatch.

`CLAUDE.md` also documents a `modules/expo-calorie-engine` module. That directory contains no source, and the calorie expenditure it was presumably meant to compute is currently a placeholder constant in the Today screen.

## Why Someone Would Do It Anyway

Nobody does this deliberately. It happens because the document was written from the plan, before the code — which is the right way to write a plan — and the plan changed during implementation without the document being revisited. NativeWind was very plausibly the original intent; unistyles was chosen later, for reasons no longer recorded anywhere.

That is the specific gap this framework exists to close: the styling choice is now recorded as [Decision: Unistyles for Styling](../../decisions/003-unistyles-styling.md), including what it replaced and why the replacement is not visible in `CLAUDE.md`.

## What To Do About It

`CLAUDE.md` should be corrected — its styling and animation sections, and the reference to the calorie engine module. Until then, treat `context/decisions/` as authoritative over `CLAUDE.md` on stack questions, and verify any dependency claim against `package.json` before acting on it.

## Related

- [Decision: Unistyles for Styling](../../decisions/003-unistyles-styling.md)
- [Decision: Tech Stack](../../decisions/001-tech-stack.md)
- [Decision: Thermodynamic Calorie Targets](../../decisions/008-thermodynamic-calorie-targets.md)
- [Project Intent](../../intent/project-intent.md)
- [Pattern: Unistyles Themed Stylesheet](../patterns/unistyles-themed-stylesheet.md)

## Status

- **Created**: 2026-08-13
- **Status**: Active — the mismatch is present in `CLAUDE.md` as of this date and has not been corrected
