# Code Migration Workflow

Clean up existing code to use shadcn properly.

## Find Hardcoded Values

### Run the Check Script

```bash
bash .claude/skills/shadcn-ui/scripts/check-hardcoded.sh src/
```

### Manual Search

```bash
# Tailwind color classes
grep -rn "bg-blue-\|bg-gray-\|bg-red-\|bg-green-\|text-blue-\|text-gray-" src/

# Hex colors
grep -rn "#[0-9a-fA-F]\{3,6\}" src/

# RGB values
grep -rn "rgb\|rgba" src/

# Inline styles with colors
grep -rn "style={{.*color\|style={{.*background" src/
```

## Color Replacement Map

### Tailwind Colors -> Theme Colors

| Find | Replace With |
|------|--------------|
| `bg-blue-500` | `bg-primary` |
| `bg-blue-600` | `bg-primary` (hover: `hover:bg-primary/90`) |
| `bg-gray-50` | `bg-muted` |
| `bg-gray-100` | `bg-muted` |
| `bg-gray-900` | `bg-foreground` |
| `bg-white` | `bg-background` or `bg-card` |
| `text-gray-500` | `text-muted-foreground` |
| `text-gray-600` | `text-muted-foreground` |
| `text-gray-900` | `text-foreground` |
| `text-white` | `text-primary-foreground` (on primary bg) |
| `border-gray-200` | `border-border` |
| `border-gray-300` | `border-input` |

### Hex Colors -> CSS Variables

| Find | Replace With |
|------|--------------|
| `#3b82f6` (blue) | `hsl(var(--primary))` |
| `#ef4444` (red) | `hsl(var(--destructive))` |
| `#ffffff` | `hsl(var(--background))` |
| `#000000` | `hsl(var(--foreground))` |
| `#6b7280` (gray) | `hsl(var(--muted-foreground))` |

## Component Replacement

### Native Elements -> shadcn Components

| Custom Code | shadcn Component |
|-------------|------------------|
| `<button className="...">` | `<Button>` |
| `<input className="...">` | `<Input>` |
| `<textarea className="...">` | `<Textarea>` |
| `<select className="...">` | `<Select>` |
| `<div className="card...">` | `<Card>` |
| Custom modal | `<Dialog>` |
| Custom dropdown | `<DropdownMenu>` |
| Custom tooltip | `<Tooltip>` |
| Custom tabs | `<Tabs>` |
| Custom accordion | `<Accordion>` |
| Custom checkbox | `<Checkbox>` |
| Custom switch | `<Switch>` |

### Before/After Examples

**Button:**
```tsx
// Before
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Click me
</button>

// After
<Button>Click me</Button>
```

**Card:**
```tsx
// Before
<div className="p-6 bg-white rounded-lg shadow border border-gray-200">
  <h3 className="text-gray-900 font-semibold">Title</h3>
  <p className="text-gray-500">Description</p>
</div>

// After
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
</Card>
```

**Input:**
```tsx
// Before
<input
  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
  type="text"
/>

// After
<Input type="text" />
```

**Text Colors:**
```tsx
// Before
<p className="text-gray-500">Subtitle text</p>
<h1 className="text-gray-900">Main heading</h1>

// After
<p className="text-muted-foreground">Subtitle text</p>
<h1 className="text-foreground">Main heading</h1>
```

**Background Sections:**
```tsx
// Before
<section className="bg-gray-50 py-16">
<section className="bg-blue-500 text-white py-16">

// After
<section className="bg-muted/50 py-16">
<section className="bg-primary text-primary-foreground py-16">
```

## Migration Steps

1. **Run check script** to identify all hardcoded values
2. **Install missing shadcn components**
   ```bash
   npx shadcn@latest add button card input dialog ...
   ```
3. **Replace colors** file by file
4. **Replace components** native -> shadcn
5. **Run check script again** to verify
6. **Test visually** to ensure nothing broke

## Verification Checklist

- [ ] No hardcoded Tailwind colors (bg-blue-*, text-gray-*, etc.)
- [ ] No hex colors in components (#ffffff, #000000, etc.)
- [ ] No RGB values in components
- [ ] All buttons use `<Button>`
- [ ] All inputs use `<Input>`
- [ ] All cards use `<Card>`
- [ ] All modals use `<Dialog>`
- [ ] Script passes: `bash scripts/check-hardcoded.sh src/`
