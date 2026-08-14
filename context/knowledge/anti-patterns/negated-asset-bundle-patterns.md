# Anti-pattern: Negated Asset Bundle Patterns

## What Not To Do

Do not express "keep this asset out of the build" as a negated glob in `assetBundlePatterns`:

```ts
// WRONG — do not do this
config.assetBundlePatterns = ["**/*", "!assets/data/seed-power.json"];
```

Express it as absence from a positive inclusion list:

```ts
// RIGHT
config.assetBundlePatterns = [];
```

## What Breaks

A negated pattern is a check that **fails open**. If the negation stops matching — the file is renamed, the directory moves, the bundler changes how it evaluates globs, or a future Expo version handles negation differently — the asset is silently included and nothing reports a problem.

The asset in question is the compound reference library. Including it in a build submitted to the App Store puts the listing at risk. The failure would not appear in a test, a type check, or normal use of the app; the first signal would be a rejection or a removal.

The empty inclusion list fails in the opposite direction. If that branch breaks, the sideload build is missing an asset — visible immediately, harmless, and fixable.

The two mechanisms are equally expressive and have opposite failure modes. That is the entire reason for the rule.

## How It Was Caught

This is now enforced rather than trusted. Continuous integration greps the plugin source on every push and pull request, failing if a negated pattern appears and requiring the empty-array branch to still be present:

```yaml
if grep -q '!assets/data/seed-power.json' plugins/withSeedJson.ts; then
  echo "FAIL: withSeedJson must not rely on negated assetBundlePatterns"
  exit 1
fi
grep -q 'assetBundlePatterns = \[\]' plugins/withSeedJson.ts
```
`.github/workflows/ci.yml:20-26`

Two further layers scan the source tree and the compiled binary before submission.

## Why Someone Would Do It Anyway

A negated pattern is the more natural way to express the intent, and it reads better: "include everything except this." It is also what most bundler documentation demonstrates. Someone tidying the plugin would very plausibly rewrite the two-branch version into a single expressive line — which is exactly why the continuous-integration check exists and why the prohibition is committed as a comment in the plugin itself.

Note also that the plugin has a hand-maintained CommonJS twin, and continuous integration only inspects the TypeScript file. A negation introduced into the twin would not be caught by the first layer.

## Related

- [Decision: Dual Distribution With Seed Stripping](../../decisions/012-dual-distribution-seed-stripping.md)
- [Feature: Dual Distribution](../../intent/feature-dual-distribution.md)
- [Pattern: Variant-Gated Config Plugin](../patterns/variant-gated-config-plugin.md)
- [Pattern: Defense in Depth on One Invariant](../patterns/defense-in-depth-on-one-invariant.md)

## Status

- **Created**: 2026-08-13
- **Status**: Active
