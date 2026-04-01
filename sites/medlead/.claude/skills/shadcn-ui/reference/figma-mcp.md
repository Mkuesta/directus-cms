# Figma MCP Integration

This reference documents how to use Figma MCP tools to extract design tokens and context from Figma files.

## Available MCP Tools

### Primary Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `mcp__figma__get_design_context` | Get UI code and design context | Main tool for extracting component code |
| `mcp__figma__get_variable_defs` | Get design tokens/variables | Extract colors, spacing, typography tokens |
| `mcp__figma__get_screenshot` | Capture node screenshot | Visual reference for implementation |
| `mcp__figma__get_metadata` | Get structure overview in XML | Understand layer hierarchy and node IDs |

### Secondary Tools

| Tool | Purpose |
|------|---------|
| `mcp__figma__get_code_connect_map` | Get Code Connect mappings if available |
| `mcp__figma__whoami` | Check authenticated user (debugging) |
| `mcp__figma__generate_diagram` | Create flowcharts in FigJam |

## URL Parsing Guide

### Standard Figma URLs

```
Format: https://figma.com/design/:fileKey/:fileName?node-id=:int1-:int2

Example: https://figma.com/design/abc123xyz/MyDesign?node-id=1-234

Extracted values:
- fileKey: "abc123xyz"
- nodeId: "1:234" (replace - with :)
```

### Branch URLs

```
Format: https://figma.com/design/:fileKey/branch/:branchKey/:fileName

Use branchKey as the fileKey for branch files.
```

### Node ID Format

```
In URL: node-id=1-234
For MCP: nodeId="1:234" (replace hyphen with colon)
```

## Step-by-Step Extraction Workflow

### 1. Get the Figma URL

Ask user for the Figma URL or file link.

### 2. Parse URL Components

```
URL: https://figma.com/design/pqrs123/ProjectName?node-id=100-200

fileKey = "pqrs123"
nodeId = "100:200"
```

### 3. Get Design Context (Primary)

```
Tool: mcp__figma__get_design_context
Parameters:
  - fileKey: "pqrs123"
  - nodeId: "100:200"
  - clientLanguages: "typescript,html,css"
  - clientFrameworks: "react,tailwind"

Returns: Generated code, component structure, styles
```

### 4. Get Variable Definitions

```
Tool: mcp__figma__get_variable_defs
Parameters:
  - fileKey: "pqrs123"
  - nodeId: "100:200"

Returns: Design tokens like:
{
  'color/primary': '#3b82f6',
  'color/secondary': '#6366f1',
  'spacing/md': '16px',
  'radius/default': '8px'
}
```

### 5. Get Screenshot (Visual Reference)

```
Tool: mcp__figma__get_screenshot
Parameters:
  - fileKey: "pqrs123"
  - nodeId: "100:200"

Returns: Image of the selected node
```

### 6. Get Metadata (Structure)

```
Tool: mcp__figma__get_metadata
Parameters:
  - fileKey: "pqrs123"
  - nodeId: "100:200"

Returns: XML structure with:
- Layer names
- Node IDs
- Positions and sizes
- Component types
```

## Example Commands

### Extract Full Design Context

```
mcp__figma__get_design_context
  fileKey: "abc123"
  nodeId: "1:234"
  clientLanguages: "typescript"
  clientFrameworks: "react,tailwind"
```

### Extract Color Variables

```
mcp__figma__get_variable_defs
  fileKey: "abc123"
  nodeId: "1:234"
```

### Get Page Overview

```
mcp__figma__get_metadata
  fileKey: "abc123"
  nodeId: "0:1"  // Page node ID is usually 0:1
```

## Mapping Figma Variables to shadcn

| Figma Variable | shadcn CSS Variable |
|----------------|---------------------|
| `color/primary` | `--primary` |
| `color/secondary` | `--secondary` |
| `color/background` | `--background` |
| `color/foreground` | `--foreground` |
| `color/muted` | `--muted` |
| `color/border` | `--border` |
| `color/destructive` | `--destructive` |
| `radius/default` | `--radius` |

### Conversion Process

```
Figma: color/primary = #3b82f6
       ↓
HSL: hsl(217, 91%, 60%)
       ↓
shadcn: --primary: 217 91% 60%;
```

## Troubleshooting

### Authentication Issues

```
Tool: mcp__figma__whoami

Check if the correct user is authenticated.
If issues persist, verify Figma MCP configuration.
```

### Permission Errors

- Ensure the Figma file is accessible to the authenticated user
- Check if the file requires specific permissions
- Verify the file hasn't been moved or deleted

### Invalid Node ID

- Double-check the URL parsing (hyphen → colon)
- Use `get_metadata` on page node (0:1) to find valid node IDs
- Ensure the node exists in the current file version

### Large Files

For very large files:
1. Start with `get_metadata` to understand structure
2. Target specific nodes instead of entire pages
3. Extract sections one at a time

## Best Practices

1. **Always get context first** - Use `get_design_context` as primary tool
2. **Verify with screenshot** - Use `get_screenshot` to confirm correct node
3. **Extract tokens early** - Get `variable_defs` before building components
4. **Use metadata for navigation** - Find specific node IDs with `get_metadata`
5. **Specify frameworks** - Always include `clientLanguages` and `clientFrameworks`

## Integration with Theming Workflow

1. Get Figma URL from user
2. Extract variables with `get_variable_defs`
3. Map to shadcn CSS variables (see [extraction-tables.md](extraction-tables.md))
4. Get design context with `get_design_context`
5. Build components following shadcn patterns
6. Verify against screenshot from `get_screenshot`
