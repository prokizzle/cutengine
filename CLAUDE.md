# CutEngine — Expo

Expo SDK 56 rewrite. See project memory:
`project_cutengine_v2_scope`, `project_pedtracker_appstore_strategy`,
`reference_foundationmodels_token_opaque_prompting`.

## Stack

- **Runtime:** Bun + Expo SDK 56 + React Native 0.85 + React 19
- **Router:** Expo Router (typed routes enabled)
- **Styling:** NativeWind v4 + Tailwind CSS v4 (design tokens in `global.css`)
- **Animation:** Reanimated v4
- **Payments:** RevenueCat (`react-native-purchases`)
- **Crash reports:** Sentry (`@sentry/react-native`)
- **HealthKit:** `expo-health`
- **TypeScript:** 6.0 (strict)

## Commands

```bash
bun run start       # Expo dev server
bun run ios         # iOS simulator
bun run lint        # tsc --noEmit
```

## Conventions

- Expo Router file-based routing in `app/`
- Tailwind classes via `className` (NativeWind)
- Environment variables: `EXPO_PUBLIC_` prefix for client-readable
- Design tokens in `global.css` mirror `DesignSystem` Swift package palette

## App Store / Sideload Profiles

Configured via EAS Build profiles.
- `production`: `com.feelingmindful.diet-plan` (App Store)
- `internal`: same bundle (TestFlight)
- `sideload`: `com.feelingmindful.cutengine.power` (AltStore/Sideloadly)

### Build Commands

```bash
bun run build:prod        # eas build --profile production
bun run build:internal    # eas build --profile internal
bun run build:sideload    # eas build --profile sideload
```

### Pre-Submit Checklist

```bash
./scripts/pre-submit-check.sh                          # Source scan
./scripts/verify-seed-strip.sh path/to/App.app         # Binary scan
bun run lint                                           # Type check
```

### Sideload Distribution

1. `bun run build:sideload` — produces .ipa with seeded compound library
2. Download from EAS dashboard
3. Install via AltStore / Sideloadly / Feather
4. Bundle ID: `com.feelingmindful.cutengine.power` (separate from App Store listing)

The sideload build includes `assets/data/seed-power.json` (46 compounds).
The production build strips this file via `plugins/withSeedJson.ts`.

## Architecture

```
app/                  # Expo Router screens
  _layout.tsx         # Root layout (Sentry, RevenueCat init)
  index.tsx           # Home / today screen
components/           # Reusable UI
modules/              # Expo Modules (native Swift)
  expo-calorie-engine/
  expo-cycle-store/
  expo-nl-cycle-parser/
```

## Related Projects

- bodyengine-ios (Tuist monorepo, CardioEngine + legacy CutEngine)
- project_cutengine_v2_scope (Linear: CutEngine v2 — Expo Rewrite)
