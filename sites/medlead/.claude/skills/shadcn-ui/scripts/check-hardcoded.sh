#!/bin/bash
# =============================================================================
# Check for Hardcoded Colors
# =============================================================================
# Scans source files for hardcoded colors that should use shadcn theme variables.
#
# Usage:
#   bash check-hardcoded.sh [directory]
#   bash check-hardcoded.sh src/
#   bash check-hardcoded.sh components/
#
# Exit codes:
#   0 - No hardcoded colors found
#   1 - Hardcoded colors found
# =============================================================================

DIR=${1:-.}
ISSUES=0

echo "=========================================="
echo "  shadcn Hardcoded Color Checker"
echo "=========================================="
echo ""
echo "Scanning: $DIR"
echo ""

# =============================================================================
# Check for Hardcoded Tailwind Colors
# =============================================================================
echo "=== Hardcoded Tailwind Colors ==="
echo ""

TAILWIND_COLORS="bg-blue-\|bg-gray-\|bg-red-\|bg-green-\|bg-yellow-\|bg-purple-\|bg-pink-\|bg-indigo-\|bg-orange-\|bg-teal-\|bg-cyan-\|bg-slate-\|bg-zinc-\|bg-neutral-\|bg-stone-"
TAILWIND_TEXT="text-blue-\|text-gray-\|text-red-\|text-green-\|text-yellow-\|text-purple-\|text-pink-\|text-indigo-\|text-orange-\|text-teal-\|text-cyan-\|text-slate-\|text-zinc-\|text-neutral-\|text-stone-"
TAILWIND_BORDER="border-blue-\|border-gray-\|border-red-\|border-green-\|border-yellow-"

TAILWIND_MATCHES=$(grep -rn --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js" \
  "$TAILWIND_COLORS\|$TAILWIND_TEXT\|$TAILWIND_BORDER" \
  "$DIR" 2>/dev/null | grep -v "node_modules" | grep -v ".next" | head -50)

if [ -n "$TAILWIND_MATCHES" ]; then
    echo "$TAILWIND_MATCHES"
    echo ""
    ISSUES=$((ISSUES + 1))
else
    echo "✅ None found"
    echo ""
fi

# =============================================================================
# Check for Hardcoded Hex Colors
# =============================================================================
echo "=== Hardcoded Hex Colors ==="
echo ""

HEX_MATCHES=$(grep -rn --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js" \
  "#[0-9a-fA-F]\{3,6\}" "$DIR" 2>/dev/null | \
  grep -v "node_modules" | \
  grep -v ".next" | \
  grep -v "var(--" | \
  grep -v "tailwind" | \
  grep -v "\.config" | \
  head -50)

if [ -n "$HEX_MATCHES" ]; then
    echo "$HEX_MATCHES"
    echo ""
    ISSUES=$((ISSUES + 1))
else
    echo "✅ None found"
    echo ""
fi

# =============================================================================
# Check for Inline Style Colors
# =============================================================================
echo "=== Inline Style Colors ==="
echo ""

STYLE_MATCHES=$(grep -rn --include="*.tsx" --include="*.jsx" \
  "style={{.*color\|style={{.*background\|style={{.*borderColor" "$DIR" 2>/dev/null | \
  grep -v "node_modules" | \
  grep -v ".next" | \
  grep -v "var(--" | \
  head -30)

if [ -n "$STYLE_MATCHES" ]; then
    echo "$STYLE_MATCHES"
    echo ""
    ISSUES=$((ISSUES + 1))
else
    echo "✅ None found"
    echo ""
fi

# =============================================================================
# Check for RGB/RGBA Values
# =============================================================================
echo "=== RGB/RGBA Values ==="
echo ""

RGB_MATCHES=$(grep -rn --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js" \
  "rgb(\|rgba(" "$DIR" 2>/dev/null | \
  grep -v "node_modules" | \
  grep -v ".next" | \
  grep -v "\.css" | \
  head -20)

if [ -n "$RGB_MATCHES" ]; then
    echo "$RGB_MATCHES"
    echo ""
    ISSUES=$((ISSUES + 1))
else
    echo "✅ None found"
    echo ""
fi

# =============================================================================
# Summary
# =============================================================================
echo "=========================================="
echo "  Summary"
echo "=========================================="
echo ""

if [ $ISSUES -eq 0 ]; then
    echo "✅ All clear! No hardcoded colors found."
    echo ""
    echo "Your code follows shadcn theming best practices."
    exit 0
else
    echo "❌ Found $ISSUES category(ies) with hardcoded colors."
    echo ""
    echo "Replace with theme variables:"
    echo ""
    echo "  Tailwind Colors:"
    echo "    bg-blue-500     → bg-primary"
    echo "    bg-blue-600     → bg-primary (hover: hover:bg-primary/90)"
    echo "    bg-gray-50      → bg-muted"
    echo "    bg-gray-100     → bg-muted"
    echo "    bg-gray-900     → bg-foreground"
    echo "    bg-white        → bg-background or bg-card"
    echo "    text-gray-500   → text-muted-foreground"
    echo "    text-gray-900   → text-foreground"
    echo "    text-white      → text-primary-foreground (on primary bg)"
    echo "    border-gray-200 → border-border"
    echo ""
    echo "  Hex Colors:"
    echo "    #3b82f6         → hsl(var(--primary))"
    echo "    #ffffff         → hsl(var(--background))"
    echo "    #000000         → hsl(var(--foreground))"
    echo "    Or use classes: text-primary, bg-primary, etc."
    echo ""
    echo "  Inline Styles:"
    echo "    style={{ color: '#fff' }}  → className=\"text-primary-foreground\""
    echo "    style={{ background: X }}  → className=\"bg-primary\""
    echo ""
    exit 1
fi
