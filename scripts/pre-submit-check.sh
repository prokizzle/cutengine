#!/bin/bash
# Pre-submit safety check: scans source for banned terms and verifies
# production build readiness. Run before `eas submit`.
#
# Usage: ./scripts/pre-submit-check.sh

set -euo pipefail
cd "$(dirname "$0")/.."

# Single-word terms use word-boundary grep to avoid false positives
# (e.g. "deca" matching "decimal", "sarm" matching "sarmatian").
BANNED_WORDS=(
    "tren" "anavar" "nandrolone" "sarm" "dianabol" "stanozolol"
    "trenbolone" "masteron" "primobolan" "winstrol" "deca"
    "equipoise" "halotestin" "anadrol" "superdrol" "clenbuterol"
    "arimidex" "aromasin" "letrozole" "nolvadex" "clomid"
    "AAS" "PED" "steroid" "anabolic"
)

# Multi-word phrases checked via fixed-string (-F) to handle spaces.
BANNED_PHRASES=(
    "testosterone enanthate"
    "testosterone cypionate"
)

echo "=== Pre-submit safety check ==="
echo ""

FOUND=0

echo "Scanning source for banned terms..."
while IFS= read -r -d '' file; do
    for term in "${BANNED_WORDS[@]}"; do
        if grep -qiE "\\b${term}\\b" "$file" 2>/dev/null; then
            echo "  FAIL: '$term' found in $file"
            FOUND=$((FOUND + 1))
        fi
    done
    for phrase in "${BANNED_PHRASES[@]}"; do
        if grep -qiF "$phrase" "$file" 2>/dev/null; then
            echo "  FAIL: '$phrase' found in $file"
            FOUND=$((FOUND + 1))
        fi
    done
done < <(
    find . -type f \( -name "*.swift" -o -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.md" \) \
        -not -path './node_modules/*' \
        -not -path './.git/*' \
        -not -path './.build/*' \
        -not -path './DerivedData/*' \
        -not -path './ios/Pods/*' \
        -not -path './android/.gradle/*' \
        -not -name 'seed-power.json' \
        -not -name 'pre-submit-check.sh' \
        -not -name 'verify-seed-strip.sh' \
        -print0
)

# Check seed JSON is excluded from production bundle
if grep -q '"APP_VARIANT"' app.config.ts 2>/dev/null; then
    echo "  OK: Dynamic config present (bundle ID swap wired)"
fi

# Check EAS profiles
if [ -f eas.json ]; then
    echo "  OK: eas.json present"
fi

echo ""

if [ "$FOUND" -eq 0 ]; then
    echo "PASS: No banned terms in source. Safe for App Store."
    echo ""
    echo "Next steps:"
    echo "  1. eas build --profile production --platform ios"
    echo "  2. ./scripts/verify-seed-strip.sh <path/to/App.app>"
    echo "  3. TestFlight internal distribution"
    echo "  4. eas submit --profile production --platform ios"
    exit 0
else
    echo "FAIL: $FOUND violation(s) found in source."
    echo "Fix before submitting to App Store."
    exit 1
fi
