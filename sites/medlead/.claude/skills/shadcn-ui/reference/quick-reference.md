# shadcn/ui Quick Reference

## 3-Step Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: STYLE                                                      │
│  "I like how THIS looks"                                            │
│                                                                     │
│  Provide: Figma URL or screenshot of design you like                │
│  Claude extracts: Colors, fonts, spacing, radius -> shadcn theme    │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 2: STRUCTURE                                                  │
│  "I need what THAT has"                                             │
│                                                                     │
│  Provide: Competitor site / section references                      │
│  Claude identifies: Hero, features, pricing, FAQ, etc.              │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 3: BUILD                                                      │
│  "Build THAT structure with THIS style"                             │
│                                                                     │
│  Claude builds: Sections using YOUR style + shadcn components       │
└─────────────────────────────────────────────────────────────────────┘
```

## Quick Commands

**All at once:**
```
STEP 1 - Style I like:
[Figma URL of design aesthetic]

STEP 2 - Sections I need:
Competitor: [URL or screenshot]
- Hero section
- Pricing section
- Testimonials

STEP 3 - Build using shadcn
```

**Step by step:**

| Step | Say this... |
|------|-------------|
| Extract style | "Extract the style from this for shadcn: [Figma URL]" |
| Note structure | "Here's my competitor, note the sections: [URL]" |
| Build section | "Build the hero section" |
| Build page | "Build the full landing page" |
| Custom component | "Create a Testimonial Card component" |

## Theme Color Classes

### Backgrounds
```tsx
bg-background      // Page background
bg-card            // Card background
bg-muted           // Muted/subtle background
bg-muted/50        // Semi-transparent muted
bg-primary         // Primary brand color
bg-secondary       // Secondary color
bg-accent          // Accent/highlight
bg-destructive     // Error/danger
```

### Text
```tsx
text-foreground          // Default text
text-muted-foreground    // Subtle/secondary text
text-primary             // Primary color as text
text-primary-foreground  // Text ON primary background
text-destructive         // Error text
```

### Borders
```tsx
border-border      // Default border
border-input       // Input border
border-primary     // Primary color border
```

### Focus
```tsx
ring-ring          // Focus ring color
```

## Common Patterns

**Page Section:**
```tsx
<section className="py-16 md:py-24">
  <div className="container">
    {/* your content */}
  </div>
</section>
```

**Muted Background Section:**
```tsx
<section className="py-16 bg-muted/50">
```

**Primary CTA Section:**
```tsx
<section className="py-16 bg-primary text-primary-foreground">
```

**Feature Card Grid:**
```tsx
<div className="grid md:grid-cols-3 gap-6">
  <Card>
    <CardHeader>
      <CardTitle>Feature</CardTitle>
      <CardDescription>Description here</CardDescription>
    </CardHeader>
  </Card>
</div>
```

**CTA Buttons:**
```tsx
<div className="flex flex-col sm:flex-row gap-4">
  <Button size="lg">Primary Action</Button>
  <Button size="lg" variant="outline">Secondary</Button>
</div>
```

## Adding Components

```bash
# Add individual components
npx shadcn@latest add button card input dialog avatar badge

# See all available
npx shadcn@latest add
```

## Don't Do This -> Do This

```tsx
// DON'T: Hardcoded colors
<div className="bg-blue-500 text-white">
// DO: Theme colors
<div className="bg-primary text-primary-foreground">

// DON'T: Custom button
<button className="px-4 py-2 bg-blue-500 rounded">
// DO: shadcn Button
<Button>Click me</Button>

// DON'T: Hardcoded gray
<p className="text-gray-500">
// DO: Theme muted
<p className="text-muted-foreground">

// DON'T: Hex colors
<div style={{ color: '#3b82f6' }}>
// DO: CSS variable or class
<div className="text-primary">
```

## Theme Files Location

```
your-project/
└── app/
    └── globals.css      <- CSS variables here
```

```css
/* globals.css */
:root {
  --primary: 217 91% 60%;        /* Your brand color (HSL) */
  --primary-foreground: 0 0% 100%;
  /* ... */
}
```

## When to Build Custom vs Use Existing

```
Need a button?           -> npx shadcn@latest add button
Need a card?             -> npx shadcn@latest add card
Need a modal?            -> npx shadcn@latest add dialog
Need a dropdown?         -> npx shadcn@latest add dropdown-menu
Need testimonial card?   -> Build custom (see workflows/custom-component.md)
Need pricing table?      -> Build custom OR compose from Card + Badge
Need stats section?      -> Just use divs + Tailwind (not a component)
```
