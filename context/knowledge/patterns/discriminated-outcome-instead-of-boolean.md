# Pattern: Discriminated Outcome Instead of a Boolean

## Description

An operation with more than two meaningful results returns a discriminated union naming each one, not a boolean. Callers switch over every case exhaustively, and the type-checker proves no case was forgotten.

## When to Use

Any operation where "did not succeed" has more than one cause and the causes call for different responses. The canonical case: an update check, where "no update available" and "the check failed" are entirely different situations that a boolean makes indistinguishable.

## Pattern

- Define a union of string literal states, one per distinguishable result.
- Return that union rather than a boolean or a nullable value.
- Callers `switch` over all cases with no default branch, so adding a state breaks compilation at every call site.
- Never collapse a failure into the same value as a benign negative result.

## Example

The five-state outcome:

```ts
// lib/ota.ts — "disabled" | "up-to-date" | "staged" | "already-pending" | "error"
export type UpdateCheckOutcome =
  | { status: "disabled" }
  | { status: "up-to-date" }
  | { status: "staged" }
  | { status: "already-pending" }
  | { status: "error" };
```
`lib/ota.ts:4-9`

And the exhaustive handling, one distinct message per case:

```ts
// app/(tabs)/settings.tsx — switch over all five outcomes
// "up-to-date" → "You're on the latest version"
// "error"      → a failure message, never reported as up to date
```
`app/(tabs)/settings.tsx:50-81`

The same shape appears where a purchase distinguishes user cancellation from failure, so a user who backed out is not shown an error:

```ts
// lib/revenueCat.ts — err?.userCancelled → { success: false, error: "cancelled" }
```
`lib/revenueCat.ts`

The caller then treats `"cancelled"` as silent rather than as an error to display.

Related in spirit: exhaustive `switch` over domain unions with no default branch, relying on the type-checker rather than a runtime fallback.

```ts
// components/timeline/TimelineHero.tsx:23-43 — switch over Phase, no default
```

## Files Using This Pattern

- `lib/ota.ts` — the five-state update check outcome
- `app/(tabs)/settings.tsx` — exhaustive switch producing a distinct message per outcome
- `lib/revenueCat.ts` — purchase result distinguishing cancellation from failure
- `hooks/usePaywall.ts` — treats cancellation as silent, failure as reportable
- `components/timeline/TimelineHero.tsx` — exhaustive phase switch with no default branch
- `utils/phaseSuggestion.ts` — suggestion kinds as a named union rather than a generic warning

## Related

- [Decision: Over-the-Air Updates With Fingerprint Runtime Versioning](../../decisions/014-expo-updates-ota.md)
- [Decision: RevenueCat Entitlement Gating](../../decisions/011-revenuecat-entitlement-gating.md)
- [Feature: App Updates](../../intent/feature-app-updates.md)
- [Feature: Subscription Access](../../intent/feature-subscription-access.md)
- [Pattern: Capture Before Degrading](capture-before-degrading.md)
- [Pattern: Null Means Insufficient Evidence](null-means-insufficient-evidence.md)
- [Pattern: Native Module Behind a lib Facade](native-module-behind-lib-facade.md)

## Status

- **Created**: 2026-08-13
- **Status**: Active
