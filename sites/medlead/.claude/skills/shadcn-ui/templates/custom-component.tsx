/**
 * shadcn/ui Custom Component Template
 *
 * Instructions:
 * 1. Replace "ComponentName" with your component name (PascalCase)
 * 2. Replace "component-name" with kebab-case version
 * 3. Update base classes in cva()
 * 4. Add/modify variants as needed
 * 5. Add custom props to the interface
 * 6. Save as components/ui/[component-name].tsx
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// 1. Define variants using cva (class-variance-authority)
const componentNameVariants = cva(
  // Base classes (always applied)
  "relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      // Visual variants
      variant: {
        default: "bg-card text-card-foreground border border-border",
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      // Size variants
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    // Default values
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

// 2. Define props interface
export interface ComponentNameProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentNameVariants> {
  // Add custom props here
  // title?: string
  // description?: string
  // icon?: React.ReactNode
  // asChild?: boolean
}

// 3. Create component with forwardRef
const ComponentName = React.forwardRef<HTMLDivElement, ComponentNameProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <div
        className={cn(componentNameVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)

// 4. Set displayName for debugging
ComponentName.displayName = "ComponentName"

// 5. Export component and variants
export { ComponentName, componentNameVariants }

/* =============================================================================
 * EXAMPLE: Testimonial Card
 * =============================================================================
 *
 * import * as React from "react"
 * import { cva, type VariantProps } from "class-variance-authority"
 * import { cn } from "@/lib/utils"
 * import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
 * import { Card, CardContent } from "@/components/ui/card"
 *
 * const testimonialCardVariants = cva("relative", {
 *   variants: {
 *     variant: {
 *       default: "",
 *       featured: "border-primary bg-primary/5",
 *     },
 *   },
 *   defaultVariants: {
 *     variant: "default",
 *   },
 * })
 *
 * export interface TestimonialCardProps
 *   extends React.HTMLAttributes<HTMLDivElement>,
 *     VariantProps<typeof testimonialCardVariants> {
 *   quote: string
 *   author: string
 *   role?: string
 *   avatar?: string
 * }
 *
 * const TestimonialCard = React.forwardRef<HTMLDivElement, TestimonialCardProps>(
 *   ({ className, variant, quote, author, role, avatar, ...props }, ref) => {
 *     const initials = author
 *       .split(" ")
 *       .map((n) => n[0])
 *       .join("")
 *       .toUpperCase()
 *
 *     return (
 *       <Card
 *         className={cn(testimonialCardVariants({ variant, className }))}
 *         ref={ref}
 *         {...props}
 *       >
 *         <CardContent className="pt-6">
 *           <blockquote className="text-muted-foreground mb-4">
 *             "{quote}"
 *           </blockquote>
 *           <div className="flex items-center gap-3">
 *             <Avatar>
 *               <AvatarImage src={avatar} alt={author} />
 *               <AvatarFallback>{initials}</AvatarFallback>
 *             </Avatar>
 *             <div>
 *               <p className="font-medium leading-none">{author}</p>
 *               {role && (
 *                 <p className="text-sm text-muted-foreground mt-1">{role}</p>
 *               )}
 *             </div>
 *           </div>
 *         </CardContent>
 *       </Card>
 *     )
 *   }
 * )
 * TestimonialCard.displayName = "TestimonialCard"
 *
 * export { TestimonialCard, testimonialCardVariants }
 *
 * // Usage:
 * // <TestimonialCard
 * //   quote="This product changed my life!"
 * //   author="Jane Smith"
 * //   role="CEO at TechCorp"
 * //   avatar="/avatars/jane.jpg"
 * //   variant="featured"
 * // />
 *
 * =============================================================================
 */
