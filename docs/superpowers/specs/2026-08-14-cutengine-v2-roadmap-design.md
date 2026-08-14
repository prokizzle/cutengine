# CutEngine v2 Roadmap — Design

**Date:** 2026-08-14
**Status:** Approved by Nick, pending Linear breakdown
**Classification:** Architectural (per superpowers:brainstorming)

## Context

The CutEngine v2 Expo rewrite (`feeling-mindful/cutengine`) is code-complete against its original spec — CUTIOS backlog is empty, every issue Done/Published/Canceled, the "CutEngine v2 — Expo Rewrite" Linear project closed. Context Mesh was adopted retroactively into the repo on 2026-08-13 (`context/`), documenting what exists.

Since then, product direction moved. `feeling-mindful-wiki/wiki/concepts/cutengine-moat-decision.md` (2026-08-13, refined same day) declares the moat as a **zero-config signal engine** — data in, one directive out — shipped as **one app, two surfaces**: a body-fat-driven cutting dashboard (store front door) and a low-config protocol/stack tracker, "EnhancedStack" (Pro power feature). Hero metric is **trend velocity, never absolute percentage** — any consistent input carries a per-user bias; the derivative cancels it.

The current app has no body-composition input at all — `bodyFatPercentage` is declared in the HealthKit module's type union but never requested. This roadmap plans the work to close that gap and ship.

### Legacy prior art

A native SwiftUI CutEngine v1 shipped and is in App Store maintenance mode (`com.feelingmindful.diet-plan`, "CutEngine: Smart Cutting Coach"). Its code was carved out of `bodyengine-ios` on 2026-07-26 (commit `bc341d7`) and no longer exists in that working tree — it is recoverable via `git archive 4476d79 -- Projects/CutEngine`.

Scouted findings that shape this plan:

- **v1 never wired HealthKit body fat either** — `CutControlEngine.swift:215` is an explicit `// [Future]` stub. Its input hierarchy was DEXA (via a now-dead BodySpec REST/OAuth integration) → Navy tape + caliper → manual entry → tier guess.
- **v1's DEXA calibration offsets are genuinely portable.** `calibrateCalipers`/`calibrateNavy` rebase a method's persistent offset whenever a DEXA reading and another method's reading land on the same day. This is the wiki's "calibration anchor" concept, already implemented once.
- **v1 had no trend smoothing** — two-point rates over the whole cut — and displayed **absolute body-fat percentage as the hero number** ("BF · GOAL 12.0%"). This is precisely what the new direction forbids. The trend-velocity hero is a departure from v1, not a port of it.
- **v1's TDEE was a real but static formula**: Mifflin-St Jeor × an activity-tier multiplier, deliberately non-adaptive. Cheap to port, needs only height/DOB/sex — already-stubbed Settings rows.
- Everything else in v1 (compliance PDF export, supplement interaction-risk rules, labs journal, the rule-based ML calorie adjustment, deficit-tier system, recovery scorer, refeed days, entire Firebase surface, trained CoreML compliance model) is being **dropped**, per the moat-first decision below.

## Decisions Established During Brainstorming

1. **Milestone:** full backlog to a finished product, organized into Linear projects. Not a single-outcome sprint.
2. **Scope line:** moat-first, port opportunistically. v1 is prior art to mine for algorithms where it saves time, not a parity checklist.
3. **Calories:** demoted, not dropped, not rebuilt. Port v1's Mifflin-St Jeor formula (cheap — reuses already-stubbed profile fields), move it off the hero surface entirely. No adaptive TDEE, no NEAT, no ML adjustment loop.
4. **Identity:** new bundle ID, new app, new App Store listing. Old listing (`com.feelingmindful.diet-plan`) is abandoned — removed from sale, not migrated. Existing v1 subscribers are stranded on a frozen app; this is an accepted cost of the clean start.
5. **Delivery model:** solo + coding agents, no fixed date. Sequence by dependency and risk, not calendar. Size issues to complete in one agent session. Front-load the riskiest unknown.

## Architecture: The Signal Chain

```
HK bodyFatPercentage ─┐
Navy tape ────────────┼→ normalize → apply offset → 14d/14d trend → directive
Caliper ──────────────┤       ↑
DEXA anchor ──────────┴───────┘ rebases offsets
```

**Ownership.** HealthKit owns body fat, same as weight under [decision 006](../../../context/decisions/006-healthkit-weight-source-of-truth.md). Manual Navy/tape/DEXA entries are *written* to HealthKit, not stored app-side — one read path, portable user data. The app owns only the calibration state (offsets + anchor dates), which is a per-user correction, not a measurement, and belongs on the profile in the cycle store (extends [decision 007](../../../context/decisions/007-singleton-flat-phase-profile.md)).

**Normalization.** One input surface accepts four source methods — HK smart scale (auto, zero-config default, pending P0), Navy tape, caliper, DEXA anchor — into one series. Each sample tags its method, because calibration needs to know which method it's correcting.

**Calibration rebases, never averages.** Ported directly from v1's `calibrateCalipers`/`calibrateNavy`: when a DEXA reading and another method's reading land on the same day, the difference becomes that method's persistent offset, applied to every subsequent estimate from that method. This is what makes "any consistent input" work — it corrects bias instead of ignoring it.

**Trend, not value.** [Decision 017](../../../context/decisions/017-rolling-average-trend-detection.md)'s two-adjacent-14-day-window model — already implemented for weight — applies unmodified to the calibrated body-fat series, including its three-samples-per-window sufficiency gate. No new statistics.

**Output is a directive.** A discriminated union — `holding | losing-on-plan | losing-too-fast | gaining | plateau | insufficient-data` — matching the codebase's existing [Discriminated Outcome pattern](../../../context/knowledge/patterns/discriminated-outcome-instead-of-boolean.md). The UI renders copy per case. Absolute percentage exists only on a detail screen, never in the hero.

**New decisions to record** (numbering continues from 018):

- **019 Body-Composition Input Model** — HealthKit ownership, method tagging, offset calibration, ported-from-v1 provenance.
- **020 Directive Output** — why the hero is a derivative + a word, never a percentage.
- Amend 006 (body fat joins weight under HealthKit ownership).
- Outcome note on 017 (now serves two series, not one).
- Amend 008 when P7 lands (Mifflin-St Jeor replaces the placeholder; note the demotion).

## Project Breakdown

Eight Linear projects plus one throwaway spike. Each issue sized for one agent session.

### P0 — Input Premise Spike *(throwaway)*

Answer one question nothing else can proceed safely without: does the target Health store actually contain `bodyFatPercentage` samples, from what source, over what range? Output is a written finding, not shipped code. If empty, the default input changes and P3/P4 get redesigned around manual entry as default rather than HK auto-read.

### P1 — Identity Reset

- Reserve new bundle ID; create App Store Connect app record
- Update `app.config.ts` (bundle ID, name, `appleId`), `eas.json` submit profile
- New RevenueCat app, entitlement, products; re-point API key
- Remove `com.feelingmindful.diet-plan` from sale
- **Remove the static meal-plan mock tab** — shipping a fake tab in a fresh listing is indefensible under "new app, drop features" (flagged for confirmation — see Open Question below)
- Amend [decision 012](../../../context/decisions/012-dual-distribution-seed-stripping.md) for new identities; new sideload bundle ID

### P2 — Platform Hardening *(runs first, in part; continues alongside everything)*

- **Add `bun test` to `ci.yml` — highest-priority single issue in the entire backlog, lands before any other project opens.** Per [decision 016](../../../context/decisions/016-colocated-tests-and-ci.md), the suite currently never runs in CI.
- First screen tests: onboarding gate, Today derivations (`app/` currently has zero tests)
- Reconcile the two pre-submit scanners' divergent banned-term lists
- Eliminate `withSeedJson`'s CommonJS twin, or make CI inspect both
- Align `metadata/` version directory with app version
- Ignore `build/`; decide whether `.claude/` is shared

### P3 — Body Composition Input *(depends on P0)*

- Request `bodyFatPercentage` in HK authorization; read latest + history
- Normalized input series with per-sample method tagging
- Port Navy + caliper formulas from `CutControlEngine.swift:133-146` (keep the `log10` NaN guard)
- One manual-entry surface with method picker; writes back to HealthKit
- DEXA anchor entry (manual — BodySpec integration is dropped, partner API went dark)
- Port offset calibration from `calibrateCalipers`/`calibrateNavy`; persist offsets on profile with native validation

### P4 — Trend Signal Engine *(depends on P3)*

- Extend the 14d/14d trend to the calibrated body-fat series
- Directive resolver as a discriminated union
- Sufficiency gates returning `insufficient-data`
- Write ADR 019, ADR 020; amend 006; outcome note on 017

### P5 — Morning Signal Dashboard *(depends on P4 — the store front door)*

- Hero shows directive + velocity; absolute percentage removed from hero
- Wire the existing unwired `components/timeline/*` to real data
- Port `FreshnessCalculator` + staleness nudges (weigh in / log caliper / check in) from v1
- Detail screen where absolute values live
- Remove calorie target from the hero

### P6 — EnhancedStack Loop *(depends on P2 only — independent of the moat chain)*

- Persist parsed schedules (store already supports schedules + dose rules)
- Generate dose events for a given day from a schedule
- Timeline check-off writes compliance records
- Close check-in → compliance prediction on real data

### P7 — Calories, Demoted *(depends on P3, for the profile fields)*

- Capture height, date of birth, sex — replaces three Settings stubs
- Port Mifflin-St Jeor + activity multiplier from `TDEECalculator.swift:21,58`
- Replace `weightKg × 30`; move calories to detail screen only
- Amend decision 008

### P8 — Store Launch *(depends on P1, P5, P6)*

- New listing metadata written to body-fat positioning, not calories
- Screenshots
- Pre-submit checks green, submit for review
- Rebuild sideload community edition on new identity

## Sequencing

1. **P2's CI issue, alone, first.** Every subsequent project is agent-written code against a suite nothing currently runs.
2. **P0 and P1 in parallel** — the spike is an afternoon; identity work is config. Neither blocks the other.
3. **P3 → P4 → P5, strictly serial** — the moat chain.
4. **P6, any time** — shares no code with the moat chain; the thing to work on if P0 comes back ambiguous.
5. **P7, any time after P3** lands the profile fields.
6. **Rest of P2** trickles alongside everything else.
7. **P8 last** — needs P1, P5, P6 all done.

## Explicitly Out of Scope

Dropped from v1, recorded so they aren't rediscovered as gaps: compliance PDF export, supplement interaction-risk rules/alerts, labs/side-effect journal, NEAT calculator, rule-based ML calorie adjustment (lean-mass-gated), deficit-tier/enhancement-tier system, cut-plan projections (goal weight, weeks remaining), recovery scorer, refeed days, entire Firebase surface (AI parsing, Remote Config, App Check, Crashlytics, Firestore), trained CoreML compliance model (replaced by the Expo app's existing on-device logistic regression per [decision 009](../../../context/decisions/009-compliance-prediction-model.md)), BodySpec REST/OAuth integration (partner API dark since early summer — DEXA becomes manual entry), notifications, Android, intake logging, on-device vision body-fat estimation.

**Two named divergences worth flagging, not silently dropping:**

- The wiki's moat page lists **widgets** as core CutEngine DNA ("widgets, progress bars, progress signals"). Neither v1 nor v2 has ever had WidgetKit. This roadmap excludes widgets per the moat-first scope line chosen over the widgets-and-notifications line. If this is wrong, it's a ninth project.
- The **meal-plan tab is a static mock currently shipping**. Proposed for removal in P1 under "new app, drop features" rather than carried forward as dead weight. **Not yet confirmed with Nick** — see Open Question.

## Verification Strategy

- Domain logic (calibration offsets, trend extension, directive resolver) — pure functions with an injected clock, unit-tested with frozen dates, following [Pure Domain Function With an Injected Clock](../../../context/knowledge/patterns/pure-domain-function-injected-clock.md).
- P5 and P6 force the first real `app/` screen tests — overdue regardless of this roadmap.
- Distribution invariant (seed-stripping, three verification layers) extended to cover new bundle identities per [Defense in Depth on One Invariant](../../../context/knowledge/patterns/defense-in-depth-on-one-invariant.md).
- P8 gates on existing `scripts/pre-submit-check.sh` / `scripts/verify-seed-strip.sh`.
- P0 produces a written finding; anything built during it is throwaway and labeled as such.

## Risks

**P0 returning empty is the load-bearing risk.** If the target Health store has no body-fat samples, the zero-config premise collapses and P3/P4 need redesign around manual tape entry as the default input, not the fallback. This is exactly why the spike runs first, and why P6 exists as fully independent work if that redesign takes time.

**v1 has paying subscribers.** The original go/no-go doc records "existing subscribers continue uninterrupted" as the reason v1 stayed in maintenance rather than being pulled. Removing the listing from sale doesn't cancel their subscriptions, but strands them on a frozen app with no migration path, and their RevenueCat entitlements do not carry to the new app record. This is an accepted cost of decision 4 above, not an oversight.

## Open Question

Meal-plan tab removal (P1) was proposed by the assistant during design, reasoning from "new app, drop features," but was not explicitly asked about or confirmed. Confirm before P1 executes: remove the mock tab, or keep the surface reserved for later.

## Next Step

Per superpowers:brainstorming, the only skill invoked after this document is `writing-plans`, to turn this into an implementation plan. Linear project/issue creation follows from that plan, not from this document directly.
