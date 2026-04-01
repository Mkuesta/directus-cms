# shadcn Theme Colors

## Background Classes

| Class | CSS Variable | Usage |
|-------|--------------|-------|
| `bg-background` | `--background` | Page background |
| `bg-card` | `--card` | Card backgrounds |
| `bg-popover` | `--popover` | Popover/dropdown backgrounds |
| `bg-muted` | `--muted` | Subtle/muted backgrounds |
| `bg-muted/50` | `--muted` @ 50% | Semi-transparent muted |
| `bg-primary` | `--primary` | Primary brand color |
| `bg-primary/90` | `--primary` @ 90% | Primary hover state |
| `bg-secondary` | `--secondary` | Secondary color |
| `bg-accent` | `--accent` | Accent/highlight |
| `bg-destructive` | `--destructive` | Error/danger |

## Text Classes

| Class | CSS Variable | Usage |
|-------|--------------|-------|
| `text-foreground` | `--foreground` | Default text |
| `text-muted-foreground` | `--muted-foreground` | Secondary/subtle text |
| `text-primary` | `--primary` | Primary color as text |
| `text-primary-foreground` | `--primary-foreground` | Text ON primary background |
| `text-secondary-foreground` | `--secondary-foreground` | Text ON secondary background |
| `text-card-foreground` | `--card-foreground` | Text ON card background |
| `text-popover-foreground` | `--popover-foreground` | Text ON popover background |
| `text-accent-foreground` | `--accent-foreground` | Text ON accent background |
| `text-destructive` | `--destructive` | Error text |
| `text-destructive-foreground` | `--destructive-foreground` | Text ON destructive background |

## Border Classes

| Class | CSS Variable | Usage |
|-------|--------------|-------|
| `border-border` | `--border` | Default borders |
| `border-input` | `--input` | Input borders |
| `border-primary` | `--primary` | Primary color border |
| `border-destructive` | `--destructive` | Error border |

## Ring Classes (Focus)

| Class | CSS Variable | Usage |
|-------|--------------|-------|
| `ring-ring` | `--ring` | Focus ring |
| `ring-primary` | `--primary` | Primary focus ring |
| `ring-destructive` | `--destructive` | Error focus ring |

## Common Combinations

### Primary Button
```tsx
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Click me
</Button>
```

### Secondary/Muted Section
```tsx
<section className="bg-muted/50 py-16">
  <div className="container">
    <h2 className="text-foreground">Section Title</h2>
    <p className="text-muted-foreground">Description text</p>
  </div>
</section>
```

### Card
```tsx
<Card className="bg-card text-card-foreground">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription className="text-muted-foreground">
      Description
    </CardDescription>
  </CardHeader>
</Card>
```

### Subtle Text
```tsx
<p className="text-muted-foreground">
  Secondary information or descriptions
</p>
```

### Error State
```tsx
<div className="bg-destructive text-destructive-foreground p-4 rounded">
  Error message here
</div>

// Or just text
<p className="text-destructive">Something went wrong</p>
```

### CTA Section with Primary Background
```tsx
<section className="bg-primary text-primary-foreground py-16">
  <div className="container text-center">
    <h2 className="text-3xl font-bold">Ready to get started?</h2>
    <p className="text-primary-foreground/80 mt-4">
      Join thousands of users today.
    </p>
    <Button variant="secondary" className="mt-8">
      Get Started
    </Button>
  </div>
</section>
```

### Input with Focus Ring
```tsx
<Input className="focus-visible:ring-ring" />
```

## Opacity Modifiers

You can add opacity to any color:

```tsx
bg-primary/90    // 90% opacity
bg-primary/80    // 80% opacity
bg-primary/50    // 50% opacity
bg-muted/50      // 50% opacity (common for subtle backgrounds)
text-primary-foreground/80  // 80% opacity text
```

## Dark Mode

All colors automatically switch in dark mode when using `.dark` class on `<html>`:

```tsx
// These classes work in both light and dark mode
<div className="bg-background text-foreground">
  <p className="text-muted-foreground">Always correct contrast</p>
</div>
```
