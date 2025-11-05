#!/bin/bash

# Theme Compliance Audit Script
# Searches for hard-coded colors and font sizes that should use theme tokens

echo "🔍 Auditing theme compliance..."
echo ""

# Search for hex colors
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Searching for hard-coded hex colors (#RRGGBB):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
find ./src -type f \( -name "*.tsx" -o -name "*.ts" \) \
  ! -path "*/theme/*" \
  -exec grep -Hn "#[0-9A-Fa-f]\{6\}" {} \; | \
  grep -v "// OK:" | \
  sed 's/^/  ❌ /' || echo "  ✅ No hard-coded colors found!"
echo ""

# Search for RGB colors
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Searching for RGB color values:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
find ./src -type f \( -name "*.tsx" -o -name "*.ts" \) \
  ! -path "*/theme/*" \
  -exec grep -Hn "rgb(" {} \; | \
  grep -v "// OK:" | \
  sed 's/^/  ❌ /' || echo "  ✅ No RGB colors found!"
echo ""

# Search for hard-coded font sizes
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Searching for hard-coded font sizes:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
find ./src -type f \( -name "*.tsx" -o -name "*.ts" \) \
  ! -path "*/theme/*" \
  ! -path "*/utils/accessibility.ts" \
  -exec grep -Hn "fontSize:" {} \; | \
  grep -v "scaleFontSize" | \
  grep -v "theme\." | \
  grep -v "// OK:" | \
  sed 's/^/  ⚠️  /' || echo "  ✅ All font sizes use theme or scaleFontSize!"
echo ""

# Search for missing accessibility labels on buttons
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Searching for buttons without accessibility labels:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
find ./src -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -exec grep -l "<Button" {} \; | \
  while read file; do
    if ! grep -q "accessibilityLabel" "$file"; then
      echo "  ⚠️  $file: Contains <Button> without accessibilityLabel"
    fi
  done || echo "  ✅ All buttons have accessibility labels!"
echo ""

# Search for TouchableOpacity (should use AccessibleButton or FocusIndicator)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Searching for TouchableOpacity (prefer accessible alternatives):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
find ./src -type f \( -name "*.tsx" -o -name "*.ts" \) \
  ! -path "*/components/common/*" \
  -exec grep -Hn "TouchableOpacity" {} \; | \
  sed 's/^/  ⚠️  /' || echo "  ✅ Using accessible touch components!"
echo ""

# Check for theme.colors usage
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Files using theme colors correctly:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
theme_files=$(find ./src -type f \( -name "*.tsx" -o -name "*.ts" \) \
  ! -path "*/theme/*" \
  -exec grep -l "theme\.colors\|useTheme" {} \; | wc -l)
echo "  ✅ $theme_files files use theme colors"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 AUDIT SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ = Compliant | ⚠️ = Warning | ❌ = Non-compliant"
echo ""
echo "Next steps:"
echo "  1. Review all ❌ items and replace with theme tokens"
echo "  2. Review ⚠️ items for potential improvements"
echo "  3. Re-run audit after fixes"
echo "  4. Run accessibility tests (VoiceOver, TalkBack)"
echo ""
