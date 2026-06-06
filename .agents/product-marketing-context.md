# Product Marketing Context

*Last updated: 2026-06-06*

## Product Overview
**One-liner:** Adaptive daily calorie targets that move with your body — not a static number you got on day one.

**What it does:** CutEngine pulls wearable data (steps, workouts, sleep, HRV) from HealthKit and recalculates TDEE, deficit, and macros every day. It tracks supplement protocols, cycles, and meal compliance. You bring the food choices — the app gives you the right numbers and tells you if you're on track.

**Product category:** Health & Fitness / Bodybuilding Nutrition

**Product type:** Mobile app (iOS native via Expo/React Native)

**Business model:** Freemium subscription via RevenueCat. Monthly and annual plans (annual saves ~58%). Free tier includes basic calorie targets; Premium unlocks advanced protocol tracking, cycle management, and AI-powered schedule parsing.

## Target Audience
**Target companies:** N/A (B2C)

**Decision-makers:** The user is the buyer — typically male, 20-45, already tracking fitness with a wearable (Apple Watch, Whoop, Oura).

**Primary use case:** Running a structured cut (or bulk) with daily adaptive nutrition targets instead of static TDEE estimates. User already wears a tracker and wants their calorie/macro targets to reflect what they actually did yesterday.

**Jobs to be done:**
- "Tell me what to eat today based on what I actually did yesterday"
- "Keep me compliant with my protocol — supplements, meals, cycle dosing"
- "Track whether my cut is working without obsessing over the scale"

**Use cases:**
- Bodybuilder running a 12-week contest prep cut
- Enhanced athlete managing cycle dosing + nutrition in one place
- Fitness enthusiast who wants "calories on autopilot" from their watch data
- Post-bulk transition to cut with structured protocol

## Personas
*B2C app — single stakeholder, no multi-role buying committee*

| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| Enhanced bodybuilder | Cycle tracking, accurate TDEE on gear, protocol compliance | Spreadsheets + notes + calculator apps = fragmented workflow | One app: targets, protocol, compliance |
| Natural cutting athlete | Daily calorie accuracy, consistency tracking, body fat trends | Static TDEE calculators don't adapt to training load | Targets that update daily from wearable data |
| Beginner/intermediate | Simplicity, not logging every meal | MyFitnessPal fatigue — logging food is exhausting | Checklist diet: pick meals once, check off daily |

## Problems & Pain Points
**Core problem:** Calorie calculators give you one number on day one and never touch it again. Your body adapts. Your training volume changes. Your sleep varies. A static target is wrong within a week.

**Why alternatives fall short:**
- Spreadsheets: manual, error-prone, no wearable integration
- MyFitnessPal/Cronometer: meal logging focused, no adaptive TDEE, logging fatigue
- Generic TDEE calculators: static, no daily adjustment, no protocol management
- MacroFactor: closest competitor but food-logging-centric, no cycle/protocol tracking

**What it costs them:** Stalled cuts, muscle loss from over-aggressive deficits, wasted weeks from guessing. For enhanced athletes: protocol mistakes compound quickly.

**Emotional tension:** "Am I even doing this right?" — uncertainty about whether the cut is working, whether macros are correct, whether supplements are timed properly. The constant mental load of tracking across multiple apps and spreadsheets.

## Competitive Landscape
**Direct:** MacroFactor — adaptive TDEE but requires food logging; no cycle/protocol management
**Direct:** RP Diet App — structured meal planning for bodybuilders but static targets between check-ins
**Secondary:** MyFitnessPal — massive food database but calorie targets are static, no wearable adaptation
**Secondary:** Cronometer — micronutrient-focused but same static-target problem
**Indirect:** Spreadsheets + Notes app — the real competitor for enhanced athletes who build bespoke tracking systems
**Indirect:** Personal coaches — expensive ($200-500/month), async communication, inconsistent availability

## Differentiation
**Key differentiators:**
- Fully adaptive daily TDEE from wearable data — no food logging required for targets
- Built-in protocol/cycle management for enhanced athletes (compound library, dosing schedules, interaction alerts)
- Checklist diet model — not a meal planner, a compliance tool
- On-device AI protocol parsing (NL → structured schedule)
- Recovery status surfaced from sleep/HRV in plain language

**How we do it differently:** Instead of making users log every gram of food to get calorie targets, we pull activity data passively from the wearable they already wear. Targets update without logging. The app assumes you know what to eat — it gives you the numbers and tracks whether you follow through.

**Why that's better:** Logging fatigue is the #1 reason people quit nutrition apps. CutEngine removes the heaviest lift while still providing accurate, adaptive targets.

**Why customers choose us:** "I already wear an Apple Watch. I don't want another food logging app. I want something that tells me my numbers and keeps me honest."

## Objections
| Objection | Response |
|-----------|----------|
| "I need to log food to track macros accurately" | CutEngine is for people who eat repeatable meals. Pick your meals once, check them off daily. If you need per-ingredient tracking, pair it with a logging app. |
| "Is adaptive TDEE actually accurate?" | TDEE adapts from actual activity data + body weight trends, same methodology coaches use. More data → more precision over time. |
| "This looks like it's for steroid users" | The protocol tab supports any supplement stack — creatine, vitamins, pre-workout. Enhanced features exist for those who need them, but the core adaptive nutrition works for anyone. |

**Anti-persona:** Someone who wants to log every ingredient, cook different meals daily, and track micronutrients at the gram level. They should use MacroFactor or Cronometer. CutEngine is for repeatable-meal compliance, not exploratory food logging.

## Switching Dynamics
**Push:** Frustration with static calorie targets that don't reflect actual training load. Spreadsheet fatigue. App-switching fatigue (calculator + notes + calendar + health app).

**Pull:** "One app that reads my watch and tells me what to do." Protocol management built-in, not bolted on. No food logging required.

**Habit:** People are attached to their food logging streaks and historical data in MFP/Cronometer. Switching means abandoning years of meal history.

**Anxiety:** "What if the adaptive algorithm is wrong and I ruin my cut?" "What if I need more features than this has?" Trust in the TDEE model takes time to build.

## Customer Language
**How they describe the problem:**
- "I'm tired of guessing my calories"
- "My spreadsheet is out of control"
- "I don't know if my deficit is right"
- "I'm tracking in 4 different apps"

**How they describe us:**
- "It's like a coach that lives in my phone"
- "Finally something that uses my watch data"
- "Calories on autopilot"

**Words to use:** adaptive, structured, protocol, compliance, precision, dialed, on track, shred, cut, cycle, stack, timing

**Words to avoid:** diet (connotation: temporary, restrictive), weight loss (connotation: generic, non-athletic), simple/easy (belies the sophistication), beginner (audience is experienced)

**Glossary:**
| Term | Meaning |
|------|---------|
| Cut | Caloric deficit phase to lose body fat while preserving muscle |
| TDEE | Total Daily Energy Expenditure — calories burned per day |
| Protocol | User's supplement, nutrition, and cycle regimen |
| Cycle | Time-bound period of specific compound/ supplement usage |
| Stack | Combination of compounds/supplements taken together |
| Compliance | Adherence to planned protocol — meals, doses, training |
| Refeed | Planned higher-calorie day within a cut to reset hormones |
| Navy Method | Body fat estimation using tape measurements (neck, waist, height) |
| DEXA | Dual-energy X-ray absorptiometry — gold standard body composition scan |

## Brand Voice
**Tone:** Direct, credible, slightly intense. Speaks to athletes who take training seriously. Not gym-bro hype — more like a knowledgeable training partner who doesn't waste words.

**Style:** Concise, data-informed, confident. Uses numbers and specifics. No motivational fluff. No "crush your goals" energy.

**Personality:** Precise, technical, trustworthy, no-bullshit, athlete-to-athlete

## Proof Points
**Metrics:** *(to be populated post-launch)*
- Daily TDEE accuracy vs. DEXA-validated metabolic rate
- Compliance rate improvement vs. self-managed tracking
- User retention and adherence metrics

**Customers:** *(to be populated post-launch)*

**Testimonials:** *(to be populated)*

**Value themes:**
| Theme | Proof |
|-------|-------|
| Adaptive accuracy | Daily TDEE recalculation from wearable data, not a static formula |
| Protocol compliance | Checklist-based tracking with compliance scoring and predictions |
| All-in-one | Nutrition targets + cycle management + supplement scheduling in one app |
| Wearable-first | No manual logging needed — reads HealthKit passively |

## Goals
**Business goal:** Establish CutEngine as the go-to nutrition app for serious lifters and enhanced athletes — the app people recommend in fitness communities.

**Conversion action:** Download → HealthKit connect → see personalized targets → subscribe (Premium) for protocol features.

**Current metrics:** *(pre-launch — v2.0.0 Expo rewrite in development. v1.0.0 live on App Store, v1.0.1 developer rejected)*
