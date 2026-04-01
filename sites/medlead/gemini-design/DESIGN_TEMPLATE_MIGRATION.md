# Design Template Migration Guide

How to properly migrate a project to use new design templates while completely replacing existing pages.

---

## The Problem

When duplicating a project and providing new design templates, AI assistants tend to:
- Preserve existing routes and patterns
- "Update" pages instead of replacing them
- Keep old navigation flows and redirects
- Mix old component structures with new designs

This results in hybrid pages that don't match the intended design.

---

## The Solution: Use This Prompt Template

Copy and customize this prompt when you need complete page replacement:

```markdown
## Project Migration Request

### Context
I have duplicated a project and need ALL pages replaced with new designs.
The design templates are located in: `[FOLDER_PATH]`

### Critical Rules
1. **IGNORE ALL EXISTING PAGES** - Do not preserve any existing routes, components, or patterns
2. **TEMPLATE IS SOURCE OF TRUTH** - Each template file defines exactly what that page should contain
3. **NO REDIRECTS TO OLD ROUTES** - If a template shows content directly on a page, embed it there
4. **READ TEMPLATES FIRST** - Before writing any code, read ALL template files completely
5. **REPLACE, DON'T UPDATE** - This is a replacement, not an enhancement

### Design Templates Mapping
| Template File | Target Route | Action |
|---------------|--------------|--------|
| `Template-Name-1/` | `/route-1` | REPLACE completely |
| `Template-Name-2/` | `/route-2` | REPLACE completely |
| `Template-Name-3/` | `/route-3` | REPLACE completely |

### What to Remove
- [ ] Old component files that aren't in templates
- [ ] Old routes/pages not in the template list
- [ ] Redirects to deprecated routes
- [ ] Legacy patterns and flows

### What to Keep
- [ ] [List specific pages to preserve, e.g., "Thank you page"]
- [ ] [List specific utilities, e.g., "API functions in lib/"]
- [ ] [List specific config, e.g., "Environment variables"]

### Verification Steps
After implementation:
1. Each page should match its template EXACTLY in structure
2. No links should point to removed routes
3. Forms/content shown in templates should be embedded, not redirected
4. Search codebase for old references (e.g., `grep -r "old-pattern"`)
```

---

## Key Principles

### 1. Read All Templates First
Before writing any code, the AI should:
- Open and read every template file in the design folder
- Note the exact structure and components used
- Identify what content is embedded vs. linked
- Map template sections to required components

### 2. Template Structure = Page Structure
If a template shows:
- A form embedded on a page → Embed the form (don't redirect)
- A section with specific content → Create that section
- A component layout → Replicate that layout exactly

### 3. Explicit Removal List
Always specify what should be removed:
```markdown
### Routes to Remove
- `/old-route-1` - replaced by template X
- `/old-route-2` - no longer needed
- `/old-route-3/sub-route` - content now embedded in parent

### Components to Remove
- `OldComponent.tsx` - replaced by NewComponent
- `LegacyFeature.tsx` - not in new design
```

### 4. Explicit Preservation List
Clearly state what should NOT be touched:
```markdown
### Do NOT Modify
- `/thank-you` page - keep as is
- `lib/api.ts` - backend functions needed
- `components/ui/` - shared UI library
```

---

## Example: Complete Migration Prompt

```markdown
## Complete Page Replacement Request

### Design Templates Location
`./Gemini-vorlagen-inspiration/`

### Template to Route Mapping
| Template Folder | Target Route | Notes |
|-----------------|--------------|-------|
| `Falwo-company-page/` | `/resilier/[provider]` | Form embedded directly |
| `Falwo-Faq/` | `/aide` | 8 categories, animated |
| `Falwo---how-it-works/` | `/comment-ca-marche` | New sections |
| `Falwo-pricing/` | `/tarifs` | ProcessSteps added |
| `Falwo-Service/` | `/garantie` | Restructured layout |

### Critical Instructions
1. **DO NOT** preserve the existing `/resilier/[provider]/resiliation` sub-route
   - The template shows the form DIRECTLY on the company page
   - Remove the separate resiliation route entirely

2. **DO NOT** keep old component patterns
   - Read template components, create matching ones
   - Don't try to "adapt" old components

3. **READ EACH TEMPLATE COMPLETELY** before implementing
   - Note exactly what sections appear on each page
   - Note what is embedded vs. what is a separate route

### Preserve Only
- `/merci` (thank you page)
- `lib/directus.ts` (API functions)
- `components/ui/` (shadcn components)

### Remove After Migration
- Any routes not in the template mapping
- Old component files replaced by new ones
- References to old project name
```

---

## Checklist Before Starting Migration

- [ ] All template files identified and listed
- [ ] Route mapping is complete and explicit
- [ ] Preservation list is defined
- [ ] Removal list is defined
- [ ] "Embedded vs. redirected" content is clarified
- [ ] Old project references to remove are listed

---

## Common Mistakes to Avoid

| Mistake | Why It Happens | How to Prevent |
|---------|----------------|----------------|
| Keeping old redirects | AI preserves existing patterns | Explicitly state "NO redirects to old routes" |
| Forms on separate routes | AI sees existing route structure | State "form embedded directly on page per template" |
| Mixing old/new components | AI tries to reuse code | State "create new components matching template" |
| Partial implementation | AI updates instead of replaces | Use word "REPLACE" not "update" |
| Missing template sections | AI doesn't read templates fully | Request "read ALL template files first" |

---

## Verification Commands

After migration, run these checks:

```bash
# Search for old project references
grep -ri "old-project-name" --include="*.tsx" --include="*.ts"

# Find routes that shouldn't exist
find app -type d -name "old-route-name"

# Check for old component imports
grep -r "from.*OldComponent" --include="*.tsx"
```

---

## Summary

The key to successful template migration is being **explicit** about:
1. What the templates contain (read them first)
2. What routes/components to remove
3. What to preserve
4. That this is a **replacement**, not an update
5. Where content should be embedded vs. linked
