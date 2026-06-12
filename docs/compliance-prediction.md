# Compliance Miss Prediction (CUTIOS-12 + CUTIOS-20)

v2 re-spec of the v1 (bodyengine-ios) CreateML compliance model. Predicts
whether the user is likely to miss **today's daily check-in**, trained
on-device from their own history, with phase context (cut / bulk /
maintenance) as first-class features so learning carries across phase
transitions (cross-phase learning).

## Why not CreateML in v2

v1 bundled a CreateML-trained `.mlmodel` behind a Swift service. v2 is an
Expo app, and the equivalent here is a ~70-line logistic regression trained
in TypeScript (`utils/logisticRegression.ts`):

- works in Expo Go and on every platform — no native module, no bundled
  model file, nothing for `verify-seed-strip.sh` to worry about
- retrains from scratch on the user's full history at render time
  (~100 days × 16 features × 400 epochs ≈ single-digit milliseconds), so
  there is no model-staleness or update-task machinery
- deterministic and unit-testable with jest like the rest of `utils/`

## Training data

v2's persisted per-day compliance signal is the phase-tagged
`BiofeedbackEntry` (daily check-in). `utils/complianceDataset.ts` expands
entries into a contiguous local-calendar day grid from the first check-in
through yesterday; a day without an entry **is** the "missed" label. Phase
on missed days is carried forward from the last entry, and overridden by the
profile's `currentPhase` from `phaseStartDate` onward — so a phase
transition with no check-ins yet still labels days correctly and the first
day of a new phase gets a prediction (no transition gap).

When dose-event persistence ships (the Today timeline still renders mock
events), `ComplianceDayRecord` is the seam to extend: add dose-taken
fields and the same pipeline trains on supplement compliance.

## Feature vector (16 features, `FEATURE_NAMES`)

| Feature | Encoding |
| --- | --- |
| Day of week | one-hot ×7 |
| Days since last check-in | capped at 14, scaled to 0..1 |
| Current check-in streak | capped at 14, scaled to 0..1 |
| Check-in rate, last 7 / 28 days | fraction 0..1 (×2 features) |
| Mean score of last 3 check-ins | (score − 1) / 4, default 0.5 |
| Phase (CUTIOS-20) | one-hot ×3 |
| Days into current phase | capped at 56, scaled to 0..1 |

## Prediction & fallback ladder

`predictTodayMissRisk` (`utils/compliancePredictor.ts`):

| History | Behavior |
| --- | --- |
| ≥ 30 days | logistic model, trained on all phases (`source: "model"`) |
| 7–29 days | Laplace-smoothed day-of-week ⊕ overall miss-rate heuristic (`source: "heuristic"`) |
| < 7 days | no prediction (`null`) |

Risk levels: `high` ≥ 0.6, `moderate` ≥ 0.35, else `low`. Training weights
the rare miss class (capped ×4), which deliberately inflates probabilities
toward nudging — the thresholds assume that calibration.

**Integration point:** the Today screen mount (`app/(tabs)/index.tsx`) — the
"morning check". Moderate/high risk renders the dismissible
`ComplianceRiskCard` until the day's check-in is submitted. Advisory only;
nothing is automated off the prediction.

## Evaluation — single-phase vs cross-phase (CUTIOS-20)

Reproduce with `bun scripts/eval-compliance-model.ts` (synthetic users,
deterministic seeds, chronological 75/25 split, mean of 5 seeds).
Single-phase = same pipeline with training/test rows filtered to the final
phase, i.e. what a model that ignores prior phases would see.

| Scenario | Variant | Accuracy | Balanced acc. | Precision | Recall |
| --- | --- | --- | --- | --- | --- |
| Weekend skipper, 90-day cut | cross-phase | **0.886** | 0.855 | 0.867 | 0.763 |
| | single-phase | 0.886 | 0.855 | 0.867 | 0.763 |
| Friday skipper, 85d bulk → 35d cut | cross-phase | 0.756 | **0.763** | **0.520** | **0.763** |
| | single-phase | 0.822 | 0.705 | 0.300 | 0.500 |
| Erratic logger (≈ no pattern) | cross-phase | 0.520 | 0.486 | 0.480 | 0.483 |
| | single-phase | 0.500 | 0.493 | 0.428 | 0.590 |

Readings:

- **>70% accuracy** (CUTIOS-12 acceptance) holds for patterned users:
  0.886 single-phase scenario, 0.756 on the phase cycler.
- **Cross-phase improves or holds miss detection** (CUTIOS-20 acceptance):
  identical on single-phase data, and on the phase cycler balanced accuracy
  rises 0.705 → 0.763 with much better precision/recall. The single-phase
  variant's higher raw accuracy there is the class-imbalance artifact of a
  9-row test split where "never predict a miss" scores 0.89 — it finds only
  half the misses with 3× the false alarms.
- The erratic logger is the honest floor: when behavior is near-random
  (~ coin-flip miss rate, no weekday pattern), both variants sit at chance.
  Day-of-week habits are the signal this model exists to catch.
