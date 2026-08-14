# Pattern: Variant-Gated Config Plugin

## Description

Build-variant differences are driven by a single environment variable, reduced to one boolean at module scope in the app config, and applied at each branch point. Anything requiring more than a config field — such as manipulating asset bundling — is an Expo config plugin whose entire body is that one gate.

The variant is also echoed into the config's runtime-readable extras, so the app can tell which build it is.

## When to Use

Any per-distribution difference: identifiers, names, bundled assets, feature availability.

## Pattern

- One environment variable, read once into one boolean.
- Branch on that boolean at each affected config field.
- Echo the variant into runtime-readable extras.
- For anything a config field cannot express, write a config plugin — a plain function taking the config, mutating one thing, returning it.
- **Express exclusion as absence from a positive inclusion list.** Never as a negation. See the anti-pattern link below.
- Order the branches so the safe case is the fallback, not the special case.

## Example

The single boolean and its use sites:

```ts
const IS_SIDELOAD = process.env.APP_VARIANT === "sideload";     // app.config.ts:3
name: IS_SIDELOAD ? "CutEngine Pro" : "CutEngine",              // :6
bundleIdentifier: IS_SIDELOAD
  ? "com.feelingmindful.cutengine.power"
  : "com.feelingmindful.diet-plan",                             // :18-20
extra: {
  APP_VARIANT: process.env.APP_VARIANT ?? "production",
  seedIncluded: IS_SIDELOAD,                                    // :70-71
}
```

The plugin, whose whole body is the gate:

```ts
const withSeedJson: ConfigPlugin = (config) => {
  const isSideload = process.env.APP_VARIANT === "sideload";
  if (isSideload) {
    config.assetBundlePatterns = ["assets/data/seed-power.json"];
  } else {
    // No assets/data patterns — seed JSON stays out of App Store builds.
    config.assetBundlePatterns = [];
  }
  return config;
};
```
`plugins/withSeedJson.ts:15-26`

The empty array is the load-bearing part. It fails closed: if this branch stops working, the sideload build is missing an asset, which is visible and harmless. A negated pattern would fail open and ship the asset to the App Store.

## Two maintenance hazards

The plugin exists as both a TypeScript file and a hand-maintained CommonJS twin with identical logic. The config references it without a file extension, so which one loads depends on resolution. **They must be kept in sync manually**, and continuous integration only inspects the TypeScript one.

The environment variable is set per build profile in `eas.json`. TestFlight deliberately uses the production variant, so the beta build is behaviourally the submission candidate.

## Files Using This Pattern

- `app.config.ts` — the boolean and its branch points
- `plugins/withSeedJson.ts` — the plugin
- `plugins/withSeedJson.js` — the CommonJS twin
- `eas.json` — sets the variable per build profile
- `.github/workflows/ci.yml` — greps the plugin source to enforce the inclusion-list form

## Related

- [Decision: Dual Distribution With Seed Stripping](../../decisions/012-dual-distribution-seed-stripping.md)
- [Decision: Tech Stack](../../decisions/001-tech-stack.md)
- [Feature: Dual Distribution](../../intent/feature-dual-distribution.md)
- [Pattern: Defense in Depth on One Invariant](defense-in-depth-on-one-invariant.md)
- [Anti-pattern: Negated Asset Bundle Patterns](../anti-patterns/negated-asset-bundle-patterns.md)

## Status

- **Created**: 2026-08-13
- **Status**: Active
