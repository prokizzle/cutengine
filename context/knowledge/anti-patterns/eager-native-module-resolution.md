# Anti-pattern: Eager Native Module Resolution

## What Not To Do

For an iOS-only native module, do not resolve it eagerly at import time:

```ts
// WRONG for an iOS-only module
const NativeModule = requireNativeModule("ExpoNLCycleParser");
```

Resolve it optionally:

```ts
// RIGHT
// Optional resolution: the module is iOS-only, and eager requireNativeModule
// would throw at import time on Android/web before lib-level Platform guards run.
const NativeModule = requireOptionalNativeModule("ExpoCycleStore") as any;
```
`modules/expo-cycle-store/src/index.ts:82-84`

## What Breaks

The platform guards in this codebase live in the `lib/` wrappers — every wrapper function checks the platform and returns a neutral value before touching the native module. Those guards are inside function bodies, so they run when the function is called.

Eager resolution runs at **module import time**, which is before any function is called. On a non-iOS platform the import itself throws, and no guard downstream ever gets the chance to intercept it. The failure is a hard crash during module evaluation, not a degraded feature.

Optional resolution returns a null-ish handle instead of throwing, so the import succeeds and the platform guard does its job.

## How It Was Caught

Two of the three modules resolve optionally and carry the comment above explaining precisely this hazard — so the reasoning is recorded at the point where the decision was made.

**The parser module resolves eagerly and is the live exception.** It is also the one module a screen imports directly rather than through a `lib/` wrapper, so it has no platform guard at all. Both facts point the same direction: it is the module that skipped the conventions, and it would be the one to break first on a non-iOS platform.

This has not surfaced as a bug because iOS is currently the only platform built. It would surface immediately on an Android or web build.

## Why Someone Would Do It Anyway

`requireNativeModule` is the documented default and the shorter name. Eager resolution also gives a better error when the module genuinely is missing on a platform that should have it — a clear throw at import rather than a null-dereference later.

That tradeoff is real, and it is the right call for a module that exists on every supported platform. It is the wrong call here because these modules are iOS-only by design, and the codebase has deliberately chosen graceful degradation on other platforms over a hard failure.

## Related

- [Decision: Local Swift Expo Modules](../../decisions/004-local-swift-expo-modules.md)
- [Decision: On-Device Token-Opaque Natural-Language Parsing](../../decisions/010-on-device-token-opaque-nl-parsing.md)
- [Feature: Protocol Entry](../../intent/feature-protocol-entry.md)
- [Pattern: Native Module Behind a lib Facade](../patterns/native-module-behind-lib-facade.md)
- [Pattern: Capture Before Degrading](../patterns/capture-before-degrading.md)

## Status

- **Created**: 2026-08-13
- **Status**: Active
