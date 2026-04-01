# Theme Customization Workflow

Extract design tokens and configure shadcn's CSS variable theme.

## Extraction Source

### From Figma (via MCP) - Recommended

1. **Get the Figma URL** from user
   ```
   Format: https://figma.com/design/:fileKey/:fileName?node-id=:nodeId
   Extract: fileKey = :fileKey, nodeId = :nodeId (replace - with :)
   ```

2. **Extract design context**
   ```
   mcp__figma__get_design_context
   - fileKey: extracted from URL
   - nodeId: extracted from URL (e.g., "123:456")
   ```

3. **Get variable definitions** (colors, spacing)
   ```
   mcp__figma__get_variable_defs
   - fileKey: same as above
   - nodeId: same as above
   Returns: {'color/primary': #3b82f6, 'spacing/md': 16px, ...}
   ```

4. **Get screenshot** for visual reference
   ```
   mcp__figma__get_screenshot
   - fileKey: same as above
   - nodeId: same as above
   ```

For detailed MCP usage, see [../reference/figma-mcp.md](../reference/figma-mcp.md).

### From Screenshot (via Vision)

1. Analyze image for colors, fonts, spacing
2. Estimate values with confidence levels
3. Map to shadcn variables

| Element | Observed | Estimated Value | Confidence |
|---------|----------|-----------------|------------|
| Primary color | | #______ | High/Med/Low |
| Secondary color | | #______ | |
| Background | | #______ | |
| Text color | | #______ | |
| Heading font | | _______ | |
| Body font | | _______ | |
| Border radius | | ___px | |

## Mapping Process

| Design Token | shadcn Variable | CSS Class |
|--------------|-----------------|-----------|
| Primary/Brand color | `--primary` | `bg-primary` |
| Primary on dark | `--primary-foreground` | `text-primary-foreground` |
| Background | `--background` | `bg-background` |
| Card/Surface | `--card` | `bg-card` |
| Text primary | `--foreground` | `text-foreground` |
| Text secondary | `--muted-foreground` | `text-muted-foreground` |
| Border | `--border` | `border-border` |
| Error/Danger | `--destructive` | `bg-destructive` |

## Color Conversion

Convert extracted colors to shadcn's HSL format:

```
Extracted: #3b82f6
Convert to HSL: hsl(217, 91%, 60%)
shadcn format: 217 91% 60%  (remove "hsl()" and commas)
```

## Generate Theme Files

### globals.css

Use template: [../templates/globals.css](../templates/globals.css)

Key format rules:
- HSL values WITHOUT `hsl()` wrapper
- Format: `--primary: 217 91% 60%;`
- Both `:root` (light) and `.dark` themes

```css
:root {
  --primary: 217 91% 60%;        /* Your extracted color */
  --primary-foreground: 0 0% 100%;
  /* ... */
}
```

### tailwind.config.ts

Use template: [../templates/tailwind.config.ts](../templates/tailwind.config.ts)

Key additions:
- Custom fonts in `fontFamily`
- Extended colors reference CSS variables
- Container configuration

## Font Configuration

**Common Font Substitutes (if exact font unavailable):**

| Design Font | Free Alternative |
|-------------|------------------|
| Helvetica Neue | Inter |
| SF Pro | Inter |
| Proxima Nova | Nunito Sans |
| Gotham | Montserrat |
| Futura | Poppins |
| Circular | DM Sans |

**Install Google Font:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

## Verification Checklist

- [ ] Primary color set (light and dark)
- [ ] All semantic colors mapped
- [ ] Font family configured
- [ ] Border radius set (`--radius`)
- [ ] Both light and dark themes complete
- [ ] Good contrast ratios (test with browser extension)
- [ ] No hardcoded colors in output
