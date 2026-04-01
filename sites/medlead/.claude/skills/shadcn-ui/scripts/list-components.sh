#!/bin/bash
# =============================================================================
# List Installed shadcn Components
# =============================================================================
# Lists all shadcn/ui components installed in the project.
#
# Usage:
#   bash list-components.sh [components-directory]
#   bash list-components.sh components/ui/
#   bash list-components.sh src/components/ui/
#
# Default: ./components/ui
# =============================================================================

COMPONENTS_DIR=${1:-./components/ui}

echo "=========================================="
echo "  Installed shadcn/ui Components"
echo "=========================================="
echo ""
echo "Directory: $COMPONENTS_DIR"
echo ""

if [ -d "$COMPONENTS_DIR" ]; then
    echo "Components:"
    echo "-----------"

    # List all .tsx files, remove extension, sort alphabetically
    COMPONENTS=$(ls -1 "$COMPONENTS_DIR"/*.tsx 2>/dev/null | xargs -n 1 basename 2>/dev/null | sed 's/\.tsx$//' | sort)

    if [ -n "$COMPONENTS" ]; then
        echo "$COMPONENTS" | while read -r component; do
            echo "  • $component"
        done

        echo ""
        echo "-----------"
        TOTAL=$(echo "$COMPONENTS" | wc -l | tr -d ' ')
        echo "Total: $TOTAL component(s)"
    else
        echo "  No .tsx files found"
        echo ""
        echo "Run this to add components:"
        echo "  npx shadcn@latest add button card input dialog"
    fi
else
    echo "❌ Directory not found: $COMPONENTS_DIR"
    echo ""
    echo "Common locations:"
    echo "  • ./components/ui/"
    echo "  • ./src/components/ui/"
    echo ""
    echo "To initialize shadcn:"
    echo "  npx shadcn@latest init"
    echo ""
    echo "To add components:"
    echo "  npx shadcn@latest add button card input dialog"
fi

echo ""
echo "=========================================="
echo ""

# =============================================================================
# Suggested Components by Category
# =============================================================================
echo "Quick Add Commands:"
echo ""
echo "  Landing Page:"
echo "    npx shadcn@latest add button card badge avatar accordion separator"
echo ""
echo "  Dashboard:"
echo "    npx shadcn@latest add button card table tabs dropdown-menu dialog sheet avatar badge progress"
echo ""
echo "  Forms:"
echo "    npx shadcn@latest add button input textarea select checkbox radio-group switch form label toast"
echo ""
echo "  Full Suite:"
echo "    npx shadcn@latest add button card input textarea select checkbox radio-group switch form label dialog sheet dropdown-menu tabs accordion table avatar badge progress skeleton toast sonner separator scroll-area tooltip popover command breadcrumb pagination calendar"
echo ""
