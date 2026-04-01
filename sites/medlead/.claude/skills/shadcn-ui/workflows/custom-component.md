# Custom Component Workflow

Create components shadcn doesn't provide, following shadcn patterns exactly.

## Before Building

1. **Check shadcn first**: https://ui.shadcn.com/docs/components
2. **Check shadcn examples**: https://ui.shadcn.com/examples
3. **Check shadcn blocks**: https://ui.shadcn.com/blocks
4. **Only build custom if truly needed**

## What shadcn DOESN'T Have (Build Custom)

- Testimonial cards
- Pricing tables/cards
- Feature cards
- Stat cards
- Timeline
- Team member cards
- Logo clouds
- Hero sections (compose from primitives)

## Component Template

Use: [../templates/custom-component.tsx](../templates/custom-component.tsx)

Required elements:
- `cva` for variant styling
- `cn` for class merging
- `forwardRef` for ref forwarding
- TypeScript interface extending HTML attributes
- `displayName` for debugging

## Pattern

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// 1. Define variants using cva
const componentVariants = cva(
  // Base classes (always applied)
  "base-classes-here",
  {
    variants: {
      variant: {
        default: "variant-classes",
        secondary: "variant-classes",
      },
      size: {
        sm: "size-classes",
        md: "size-classes",
        lg: "size-classes",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

// 2. Define props interface
export interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {
  // Custom props here
}

// 3. Create component with forwardRef
const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        className={cn(componentVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

// 4. Set displayName
Component.displayName = "Component"

// 5. Export
export { Component, componentVariants }
```

## Example: Testimonial Card

```tsx
// components/ui/testimonial-card.tsx

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

const testimonialCardVariants = cva(
  "relative",
  {
    variants: {
      variant: {
        default: "",
        featured: "border-primary bg-primary/5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface TestimonialCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof testimonialCardVariants> {
  quote: string
  author: string
  role?: string
  avatar?: string
}

const TestimonialCard = React.forwardRef<HTMLDivElement, TestimonialCardProps>(
  ({ className, variant, quote, author, role, avatar, ...props }, ref) => {
    const initials = author
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()

    return (
      <Card
        className={cn(testimonialCardVariants({ variant, className }))}
        ref={ref}
        {...props}
      >
        <CardContent className="pt-6">
          <blockquote className="text-muted-foreground mb-4">
            "{quote}"
          </blockquote>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={avatar} alt={author} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium leading-none">{author}</p>
              {role && (
                <p className="text-sm text-muted-foreground mt-1">{role}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)
TestimonialCard.displayName = "TestimonialCard"

export { TestimonialCard, testimonialCardVariants }
```

**Usage:**
```tsx
import { TestimonialCard } from "@/components/ui/testimonial-card"

<TestimonialCard
  quote="This product changed my life!"
  author="Jane Smith"
  role="CEO at TechCorp"
  avatar="/avatars/jane.jpg"
  variant="featured"
/>
```

## File Naming

- File: `kebab-case.tsx` (e.g., `testimonial-card.tsx`)
- Component: `PascalCase` (e.g., `TestimonialCard`)
- Variants: `camelCase` (e.g., `testimonialCardVariants`)

## Verification Checklist

- [ ] Checked shadcn doesn't have it
- [ ] Uses `cva` for variants
- [ ] Uses `cn` for class merging
- [ ] Uses theme CSS variables only (no hardcoded colors)
- [ ] TypeScript interface complete
- [ ] `forwardRef` implemented
- [ ] `displayName` set
- [ ] Follows file naming: `kebab-case.tsx`
- [ ] Exported from component file
