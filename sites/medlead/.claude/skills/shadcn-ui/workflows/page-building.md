# Page Building Workflow

Build pages by composing shadcn components with your theme.

## Process

1. **Identify sections** from design/competitor
2. **Map to shadcn components** (or mark as custom)
3. **Build section by section**
4. **Verify responsive behavior**

## From Figma

Use MCP tools to analyze the layout:

```
1. mcp__figma__get_metadata -> Get structure overview (sections, layers)
2. mcp__figma__get_design_context -> Get detailed component info
3. mcp__figma__get_screenshot -> Visual reference
```

## Section Mapping

| Section Type | Primary Components | Pattern |
|--------------|-------------------|---------|
| Hero | Button, Badge | [patterns.md#hero](../reference/patterns.md#hero) |
| Features | Card, CardHeader, CardContent | [patterns.md#features](../reference/patterns.md#features) |
| Pricing | Card, Button, Badge | [patterns.md#pricing](../reference/patterns.md#pricing) |
| Testimonials | Card, Avatar | [patterns.md#testimonials](../reference/patterns.md#testimonials) |
| FAQ | Accordion | [patterns.md#faq](../reference/patterns.md#faq) |
| CTA | Button | [patterns.md#cta](../reference/patterns.md#cta) |
| Footer | NavigationMenu, links | [patterns.md#footer](../reference/patterns.md#footer) |

## Section Template

```tsx
<section className="py-16 md:py-24">
  <div className="container">
    {/* Section header */}
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold">Section Title</h2>
      <p className="text-muted-foreground mt-2">Section description</p>
    </div>

    {/* Section content */}
    <div className="grid md:grid-cols-3 gap-6">
      {/* Components here */}
    </div>
  </div>
</section>
```

## Page Structure

```tsx
// app/[page]/page.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// ... import what you need

export default function PageName() {
  return (
    <main>
      {/* Section 1: Hero */}
      <section className="py-20 md:py-32">
        <div className="container">
          {/* Hero content */}
        </div>
      </section>

      {/* Section 2: Features */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          {/* Feature grid */}
        </div>
      </section>

      {/* Continue for each section */}
    </main>
  );
}
```

## Responsive Breakpoints

| Breakpoint | Prefix | Usage |
|------------|--------|-------|
| Mobile | (none) | Default styles |
| Tablet | `md:` | 768px+ |
| Desktop | `lg:` | 1024px+ |
| Wide | `xl:` | 1280px+ |

## Common Layout Patterns

**Card Grid:**
```tsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item) => (
    <Card key={item.id}>...</Card>
  ))}
</div>
```

**Centered Content:**
```tsx
<div className="container max-w-3xl text-center">
  <h2>...</h2>
  <p>...</p>
</div>
```

**Two Column Layout:**
```tsx
<div className="grid lg:grid-cols-2 gap-12 items-center">
  <div>{/* Content */}</div>
  <div>{/* Image/Illustration */}</div>
</div>
```

**CTA Buttons:**
```tsx
<div className="flex flex-col sm:flex-row gap-4 justify-center">
  <Button size="lg">Primary Action</Button>
  <Button size="lg" variant="outline">Secondary</Button>
</div>
```

## Background Variations

```tsx
// Default background
<section className="py-16">

// Muted/subtle background
<section className="py-16 bg-muted/50">

// Primary CTA background
<section className="py-16 bg-primary text-primary-foreground">

// Card background
<section className="py-16 bg-card">
```

## Verification Checklist

- [ ] All sections from design implemented
- [ ] Only theme colors used (no hardcoded)
- [ ] Responsive at all breakpoints (mobile, tablet, desktop)
- [ ] shadcn components used where available
- [ ] Consistent spacing throughout
- [ ] Proper semantic HTML (section, main, nav, footer)
- [ ] Accessibility: proper heading hierarchy, alt texts
