---
name: shadcn-ui
description: |
  Build websites using shadcn/ui with proper theming. Extracts design tokens from Figma
  (via MCP) or screenshots, configures CSS variable themes, builds pages from shadcn
  components, and creates custom components following shadcn patterns. Use when: building
  with shadcn, theming a project, extracting styles from Figma or screenshots, creating
  UI components, migrating from hardcoded colors, or implementing designs from Figma files.
---

# shadcn/ui Development

## Quick Start

**Style + Structure approach (recommended):**

```
STEP 1 - Style I like: [Figma URL or screenshot]
         -> Extract colors, fonts, spacing -> configure shadcn theme

STEP 2 - Sections I need: [Competitor URL or screenshot]
         -> Identify sections (hero, features, pricing, FAQ...)

STEP 3 - Build using shadcn
         -> Apply Step 1 style to Step 2 sections
```

## Workflow Selection

| Task | Workflow |
|------|----------|
| Extract & configure theme from Figma | [workflows/theming.md](workflows/theming.md) |
| Build pages/sections from designs | [workflows/page-building.md](workflows/page-building.md) |
| Create custom component | [workflows/custom-component.md](workflows/custom-component.md) |
| Clean up hardcoded colors | [workflows/migration.md](workflows/migration.md) |

## Core Principles

1. **Theme colors only** - Never hardcode: use `bg-primary` not `bg-blue-500`
2. **shadcn components first** - Use existing components before building custom
3. **Follow patterns** - Custom components use `cva`, `cn`, CSS variables
4. **Figma MCP** - Use MCP tools to extract design tokens directly from Figma

## Figma MCP Quick Reference

Extract design tokens from Figma URLs:

```
URL format: https://figma.com/design/:fileKey/:fileName?node-id=:nodeId

Primary tools:
- mcp__figma__get_design_context  -> Get UI code and design context
- mcp__figma__get_variable_defs   -> Get color/spacing variables
- mcp__figma__get_screenshot      -> Visual reference captures
- mcp__figma__get_metadata        -> Structure overview (node IDs)
```

For detailed Figma MCP usage, see [reference/figma-mcp.md](reference/figma-mcp.md).

## References

- [Quick Reference](reference/quick-reference.md) - Common patterns cheat sheet
- [Theme Colors](reference/theme-colors.md) - All theme color classes
- [Component List](reference/component-list.md) - Available shadcn components
- [Patterns](reference/patterns.md) - Common section patterns (hero, pricing, etc.)
- [Extraction Tables](reference/extraction-tables.md) - Figma -> shadcn mapping
- [Figma MCP](reference/figma-mcp.md) - Figma MCP tool reference

## Templates

- [globals.css](templates/globals.css) - Theme CSS template
- [tailwind.config.ts](templates/tailwind.config.ts) - Tailwind configuration
- [custom-component.tsx](templates/custom-component.tsx) - Component boilerplate

## Validation

Run before delivering code:

```bash
# Check for hardcoded colors
bash .claude/skills/shadcn-ui/scripts/check-hardcoded.sh src/

# List installed shadcn components
bash .claude/skills/shadcn-ui/scripts/list-components.sh components/ui/
```

## Adding Components

```bash
# Add individual components
npx shadcn@latest add button card input dialog

# See all available
npx shadcn@latest add
```

## Theme Color Classes (Quick Ref)

| Purpose | Background | Text |
|---------|------------|------|
| Primary | `bg-primary` | `text-primary-foreground` |
| Secondary | `bg-secondary` | `text-secondary-foreground` |
| Muted | `bg-muted` | `text-muted-foreground` |
| Card | `bg-card` | `text-card-foreground` |
| Destructive | `bg-destructive` | `text-destructive-foreground` |
| Default | `bg-background` | `text-foreground` |
