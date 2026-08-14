# Pattern: Defense in Depth on One Invariant

## Description

When the consequence of a failure is severe and the failure would be silent, the same invariant is checked at several stages, each inspecting a different artefact. Each layer catches something the previous one would miss, and the innermost layer inspects what actually ships.

## When to Use

An invariant whose violation is both catastrophic and hard to notice. In this codebase: the compound reference library must never reach an App Store build. Losing the listing is the cost, and nothing about a wrongly-included asset is visible in normal use.

Do not apply to ordinary correctness concerns — one test is the right number of checks for a function's behaviour.

## Pattern

Order the layers from cheapest and earliest to most authoritative and latest:

1. **Configuration check, in continuous integration.** Grep the mechanism's source to assert its form. Catches the mechanism being rewritten into a weaker shape.
2. **Source check, before submission.** Scan the working tree for the content. Catches content added anywhere, not just through the known mechanism.
3. **Artefact check, before submission.** Scan the compiled binary and assert the file's absence from the bundle. The only layer that would catch a build-tool bug.

Then: prefer fail-closed constructions inside each layer, and commit the rationale for each check next to the check.

## Example

The continuous-integration layer, asserting both a prohibition and a requirement:

```yaml
- name: Verify production seed asset config
  run: |
    if grep -q '!assets/data/seed-power.json' plugins/withSeedJson.ts; then
      echo "FAIL: withSeedJson must not rely on negated assetBundlePatterns"
      exit 1
    fi
    grep -q 'assetBundlePatterns = \[\]' plugins/withSeedJson.ts
```
`.github/workflows/ci.yml:20-26`

The word-boundary matching in the scanners, with the reason committed beside it — a scanner that produces false positives on ordinary English gets bypassed:

```bash
# Single-word terms use word-boundary grep to avoid false positives
# (e.g. "deca" matching "decimal", "sarm" matching "sarmatian").
if grep -qiE "\\b${term}\\b" "$file" 2>/dev/null; then
```
`scripts/pre-submit-check.sh:10-11,34`, and the same idiom at `scripts/verify-seed-strip.sh:17-18,38`

The binary layer additionally asserts absence of the file itself, not just of its content in the strings table.

The release automation ties the source scan into the App Store path rather than leaving it as a step to remember: the validation workflow in `.asc/workflow.json` invokes `./scripts/pre-submit-check.sh` before validating.

## A live divergence worth resolving

The two scanner scripts use **different** banned-term lists. The binary scanner drops several terms the source scanner checks and adds several the source scanner does not. Whether that is intentional is not recorded anywhere, which means it reads as drift rather than as design.

## Files Using This Pattern

- `.github/workflows/ci.yml` — the configuration layer
- `scripts/pre-submit-check.sh` — the source layer
- `scripts/verify-seed-strip.sh` — the artefact layer
- `.asc/workflow.json` — wires the source layer into the release path, and gates the one irreversible action behind a boolean flag
- `plugins/withSeedJson.ts` — the fail-closed mechanism the layers protect

## Related

- [Decision: Dual Distribution With Seed Stripping](../../decisions/012-dual-distribution-seed-stripping.md)
- [Decision: Colocated Tests and Type-Check CI](../../decisions/016-colocated-tests-and-ci.md)
- [Decision: Linear Release Automation](../../decisions/018-linear-release-automation.md)
- [Feature: Dual Distribution](../../intent/feature-dual-distribution.md)
- [Pattern: Variant-Gated Config Plugin](variant-gated-config-plugin.md)
- [Anti-pattern: Negated Asset Bundle Patterns](../anti-patterns/negated-asset-bundle-patterns.md)

## Status

- **Created**: 2026-08-13
- **Status**: Active
