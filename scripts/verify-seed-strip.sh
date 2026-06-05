#!/bin/bash
# Post-build verification: confirm production IPA has no seed compound data.
# Run after `eas build` or `expo run:ios --configuration Release`.
#
# Usage: ./scripts/verify-seed-strip.sh <path/to/App.app>

set -euo pipefail

APP="${1:-ios/build/Build/Products/Release-iphoneos/CutEngine.app}"

if [ ! -d "$APP" ]; then
    echo "ERROR: App bundle not found at $APP"
    echo "Usage: $0 <path/to/App.app>"
    exit 1
fi

BANNED=(
    "tren"
    "anavar"
    "nandrolone"
    "sarm"
    "dianabol"
    "stanozolol"
    "trenbolone"
    "testosterone enanthate"
    "testosterone cypionate"
    "masteron"
    "primobolan"
    "winstrol"
    "deca"
    "equipoise"
    "halotestin"
    "anadrol"
    "superdrol"
    "clenbuterol"
    "arimidex"
    "aromasin"
    "letrozole"
    "nolvadex"
    "clomid"
    "hcg"
    "hgh"
    "peptide"
)

echo "Verifying seed strip for: $APP"
echo ""

FOUND=0
for term in "${BANNED[@]}"; do
    if strings "$APP/App" 2>/dev/null | grep -qi "$term"; then
        echo "FAIL: Found '$term' in binary"
        FOUND=$((FOUND + 1))
    fi
done

# Also check for seed JSON in bundle
if [ -f "$APP/assets/data/seed-power.json" ]; then
    echo "FAIL: seed-power.json present in bundle"
    FOUND=$((FOUND + 1))
fi

echo ""
if [ "$FOUND" -eq 0 ]; then
    echo "PASS: No seed data found. Safe for App Store submission."
    exit 0
else
    echo "FAIL: $FOUND violation(s). Do NOT submit this build."
    exit 1
fi
