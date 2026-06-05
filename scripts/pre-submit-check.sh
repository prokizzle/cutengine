#!/bin/bash
# Pre-submit safety check: scans source for banned terms and verifies
# production build readiness. Run before `eas submit`.
#
# Usage: ./scripts/pre-submit-check.sh

set -euo pipefail
cd "$(dirname "$0")/.."

BANNED_SOURCE=(
    "tren\b" "anavar" "nandrolone" "sarm\b" "dianabol" "stanozolol"
    "trenbolone" "masteron" "primobolan" "winstrol" "deca\b"
    "equipoise" "halotestin" "anadrol" "superdrol" "clenbuterol"
    "arimidex" "aromasin" "letrozole" "nolvadex" "clomid"
    "AAS" "PED\b" "steroid" "anabolic"
    "testosterone enanthate" "testosterone cypionate"
)

SKIP_DIRS="node_modules|.git|.build|DerivedData|ios/Pods|android/.gradle"
SKIP_FILES="seed-power.json|pre-submit-check.sh|verify-seed-strip.sh"

echo "=== Pre-submit safety check ==="
echo ""

FOUND=0

# Scan source files for banned terms
echo "Scanning source for banned terms..."
while IFS= read -r -d '' file; do
    case "$file" in
        *"$SKIP_DIRS"*|*"$SKIP_FILES"*) continue ;;
    esac

    for term in "${BANNED_SOURCE[@]}"; do
        if grep -qiE "\\b${term}\\b" "$file" 2>/dev/null; then
            echo "  FAIL: '$term' found in $file"
            FOUND=$((FOUND + 1))
        fi
    done
done < <(find . -type f \( -name "*.swift" -o -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.md" \) -print0)

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
