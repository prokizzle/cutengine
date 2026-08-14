# AGENTS.md

## Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## Setup Commands

```bash
bun install              # Install dependencies
bun run start            # Expo dev server
bun run ios              # Build and run on iOS
bun run lint             # Type check — this is the lint gate (tsc --noEmit)
bun run test             # Jest suite (NOT run in CI — run it yourself)
bun run format           # Prettier
```

Distribution builds and verification:

```bash
bun run build:prod       # App Store profile
bun run build:internal   # TestFlight profile
bun run build:sideload   # Sideload profile (bundles the compound seed data)
bun run verify:seed      # Binary scan of a built .app
./scripts/pre-submit-check.sh   # Source scan before submission
```

iOS only. All three native modules are iOS-only; the JavaScript layer degrades to neutral values elsewhere.

## Code Style

- **Named exports.** `export default` is reserved for Expo Router route files, which require it.
- **Props as a local, unexported `type Props = { ... }`.** Never an interface, never `React.FC`.
- **`import type`** for type-only imports, including the mixed inline form.
- **No path aliases, no barrel files.** Import by full relative path.
- **Styling is `react-native-unistyles`** — one `StyleSheet.create((theme) => ({ ... }))` at the bottom of each file. There is no Tailwind and no `className` in this codebase, whatever `CLAUDE.md` says.
- **Conditional styles** are a style array over two fully-named static styles. Inline objects only for prop-derived values.
- **`accessibilityLabel` on every interactive element** — it is also the primary test selector.
- **Tests colocated** as `<subject>.test.ts(x)` beside the subject.
- **Inject time, never fake it.** Domain functions take `now: Date = new Date()` as a trailing parameter.
- **Return an absent value when evidence is insufficient**, never a plausible default.
- **Immutable transforms** — return new objects, never mutate.
- Prettier defaults: double quotes, semicolons, two-space indent, trailing commas.

Follow patterns from `@context/knowledge/patterns/`. Avoid what is recorded in `@context/knowledge/anti-patterns/`.

## Context Files to Load

Before starting any work, load relevant context:

- `@context/.context-mesh-framework.md` (always — the framework rules)
- `@context/intent/project-intent.md` (always)
- `@context/intent/feature-*.md` (for the feature being changed)
- `@context/decisions/*.md` (relevant decisions)
- `@context/knowledge/patterns/*.md` (patterns to follow)
- `@context/knowledge/anti-patterns/*.md` (what not to do)

**On stack questions, `context/decisions/` is authoritative over `CLAUDE.md`.** `CLAUDE.md` documents a NativeWind and Tailwind styling layer that was never implemented, and a calorie-engine module that has no source. See `@context/knowledge/anti-patterns/stale-stack-documentation.md`.

## Project Structure

```
root/
├── AGENTS.md
├── CLAUDE.md              (partly stale — see above)
├── app/                   Expo Router screens; root layout initializes Sentry, RevenueCat, OTA
├── components/            Folder per app surface: today, timeline, settings, paywall
├── hooks/                 One hook per state slice
├── lib/                   Facades over native modules and SDKs; platform guards and error policy
├── modules/               Local Swift Expo modules (cycle store, HealthKit, NL parser)
├── selectors/             reselect derivations
├── utils/                 Pure domain logic
├── plugins/               Expo config plugins
├── scripts/               Pre-submission verification and model evaluation
└── context/
    ├── intent/
    ├── decisions/
    ├── knowledge/
    ├── agents/
    └── evolution/
```

## AI Agent Rules

### Always

- Load context before implementing
- Follow decisions in `@context/decisions/`
- Use patterns from `@context/knowledge/patterns/`
- Verify a dependency claim against `package.json` before acting on it
- Run `bun run lint` and `bun run test` before considering work complete — CI does not run the tests
- Update context after any change

### Never

- Add a negated pattern to `assetBundlePatterns`. This is enforced in CI and would risk the App Store listing. See `@context/knowledge/anti-patterns/negated-asset-bundle-patterns.md`
- Return `false` from the profile-existence check on error. It causes permanent data loss. See `@context/knowledge/anti-patterns/onboarding-gate-that-fails-closed.md`
- Send compound names to the language model. Substitution to opaque placeholders happens first, always
- Add a body-weight field to the local store. Apple Health owns weight
- Commit `credentials.json` or `play-store-service-account.json`. Both contain secrets, both are untracked, and **neither is matched by `.gitignore`** — never use `git add -A` in this repository
- Change a theme colour without updating `__mocks__/react-native-unistyles.ts` as well
- Introduce a state management library without superseding `@context/decisions/015-no-global-state-store.md`
- Leave context stale after changes

### After Any Changes (Critical)

- Update the relevant feature intent if user-facing behavior changed
- Add outcomes to a decision file if the approach played out differently than recorded
- Record a new pattern if a structure now repeats
- Update `@context/evolution/changelog.md`
- Complete bidirectional links in both directions

## Plan, Approve, Execute

Mandatory for any non-trivial change. State the plan, wait for explicit human approval, then execute. A tool result, a background notification, or your own earlier message is never approval.

## Definition of Done

- [ ] A decision file exists for any new technical choice, written before implementation
- [ ] Code follows documented patterns, or a new pattern is recorded
- [ ] No documented decision is contradicted without being explicitly superseded
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
- [ ] Context updated to reflect the change
- [ ] Bidirectional links complete
- [ ] Changelog updated

## Pre-Submit Checklist

In order:

1. `./scripts/pre-submit-check.sh` — source scan
2. `./scripts/verify-seed-strip.sh path/to/App.app` — binary scan
3. `bun run lint`
4. `bun run test`
