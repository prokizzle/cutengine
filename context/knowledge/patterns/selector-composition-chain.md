# Pattern: Selector Composition Chain

## Description

Expensive derivations over collections are built as a chain of `reselect` selectors, each consuming the previous ones. The chain starts from an identity selector over the raw array, and selectors are called **directly with the data as an argument** — there is no store.

## When to Use

Derivation over a collection that is expensive enough to matter and stable enough to memoize: grouping, sorting, ordering. Not for cheap per-render arithmetic, which is computed inline.

## Pattern

- An identity input selector: `(events) => events`.
- Each derived selector composes prior selectors rather than re-deriving from the raw input.
- Where a component needs several related derivations, bundle them in one final selector returning an object, so the component destructures one memoized value instead of calling several selectors.
- Call the selector directly with the array. Reselect's default single-entry reference-equality cache does the work.

## Example

The full chain, including the bundling selector:

```ts
const selectEvents = (events: DoseEvent[]) => events;

export const selectGroupedEvents = createSelector(selectEvents, groupByTimeOfDay);
export const selectUnknownBucketKeys = createSelector(selectGroupedEvents, getUnknownBucketKeys);
export const selectOrderedBuckets = createSelector(
  selectGroupedEvents,
  selectUnknownBucketKeys,
  (grouped, unknownKeys): string[] => [
    ...DISPLAY_ORDER.filter((tod) => (grouped[tod]?.length ?? 0) > 0),
    ...[...unknownKeys].sort(),
  ],
);
```
`selectors/timeline.ts:16-35`

Consumed by passing the array directly:

```tsx
// components/timeline/TimelineSpine.tsx:12
const { orderedBuckets, grouped } = selectTimelineRenderOrder(events);
```

Note the ordering policy the chain encodes: known buckets in a fixed display order with empty ones omitted, then any unrecognized bucket keys sorted alphabetically after them — so a custom bucket appears rather than disappearing.

Memoization is asserted in tests both by reference identity and by reselect's recomputation counter.

## Files Using This Pattern

- `selectors/timeline.ts` — the only selector module: grouped events, unknown bucket keys, ordered buckets, the bundled render order, and a dosed count
- `components/timeline/TimelineSpine.tsx` — the sole consumer
- `selectors/timeline.test.ts` — asserts both identity-stability and recomputation counts

## Related

- [Decision: No Global State Store](../../decisions/015-no-global-state-store.md)
- [Decision: Tech Stack](../../decisions/001-tech-stack.md)
- [Pattern: Hook Owns a Slice and Persists Before Setting State](hook-persist-then-set-state.md)
- [Pattern: Colocated Test Conventions](colocated-test-conventions.md)

## Status

- **Created**: 2026-08-13
- **Status**: Active
- **Note**: The timeline UI this serves is built and tested but not currently reachable from any screen.
