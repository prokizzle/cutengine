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

# Single-word terms use word-boundary grep to avoid false positives
# (e.g. "deca" matching "decimal", "sarm" matching "sarmatian").
BANNED_WORDS=(
    "tren" "anavar" "nandrolone" "sarm" "dianabol" "stanozolol"
    "trenbolone" "masteron" "primobolan" "winstrol" "deca"
    "equipoise" "halotestin" "anadrol" "superdrol" "clenbuterol"
    "arimidex" "aromasin" "letrozole" "nolvadex" "clomid"
    "hcg" "hgh" "peptide"
)

# Multi-word phrases checked via fixed-string (-F) to handle spaces.
BANNED_PHRASES=(
    "testosterone enanthate"
    "testosterone cypionate"
)

echo "Verifying seed strip for: $APP"
echo ""

FOUND=0
for term in "${BANNED_WORDS[@]}"; do
    if strings "$APP/App" 2>/dev/null | grep -qiE "\\b${term}\\b"; then
        echo "FAIL: Found '$term' in binary"
        FOUND=$((FOUND + 1))
    fi
done

for phrase in "${BANNED_PHRASES[@]}"; do
    if strings "$APP/App" 2>/dev/null | grep -qiF "$phrase"; then
        echo "FAIL: Found '$phrase' in binary"
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
