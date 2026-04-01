# Gemini Design Template Migration Guide

How to migrate a Next.js project to use Gemini-generated Vite/React design templates as the new frontend.

---

## Overview

This guide covers the full process of replacing an existing Next.js frontend with pages built from Gemini design templates. The templates are standalone Vite/React apps that need conversion to Next.js App Router conventions.

**What this guide assumes:**
- Target project: Next.js (App Router) with Tailwind CSS
- Source templates: Gemini-generated Vite/React apps (one folder per page)
- Each template folder contains an `App.tsx` and a `components/` directory

---

## Phase 1: Planning

### 1.1 Map Templates to Routes

Create an explicit table mapping every template folder to its target route:

```markdown
| Template Folder | Target Route | Action |
|-----------------|--------------|--------|
| `template-landing-page/` | `/` | REPLACE |
| `template-contact-page/` | `/contact` | REPLACE |
| `template-about-us/` | `/about` | REPLACE |
| `template-blog/` | `/blog` | REPLACE |
| `template-blog-post/` | `/blog/[slug]` | REPLACE |
| `template-product-page/` | `/products` | NEW route |
```

### 1.2 Identify Routes to Delete

List every existing route that has no matching template:

```markdown
| Route | Folder to Delete |
|-------|------------------|
| `/old-feature` | `app/old-feature/` |
| `/legacy-page` | `app/legacy-page/` |
```

### 1.3 Identify Routes to Keep (Deactivated)

Pages that should remain but be removed from navigation:

```markdown
| Route | Reason to Keep |
|-------|----------------|
| `/thank-you` | Payment confirmation flow |
| `/api/checkout` | Stripe checkout API |
| `/api/webhooks/*` | Payment webhook handlers |
```

### 1.4 Identify Shared Components

Every Gemini template includes its own `Navbar.tsx` and `Footer.tsx`. These must be **extracted once** as shared components, not duplicated per page.

Open each template's `App.tsx` and note:
- Which components are page-specific (Hero, ContactForm, etc.)
- Which components repeat across templates (Navbar, Footer, FloatingCTA)

Shared components go in `components/{namespace}/` (e.g., `components/mysite/SiteHeader.tsx`).
Page components go in `components/{namespace}/{page}/` (e.g., `components/mysite/landing/Hero.tsx`).

### 1.5 Decide Color Scheme

Gemini templates use Tailwind CDN with direct color classes like `text-primary`, `bg-secondary`, `bg-surface-light`. These must be mapped to CSS custom properties in `globals.css` so Tailwind resolves them.

Document your color mapping:

```
Primary:    #XXXXXX  (used as --primary, resolves to text-primary, bg-primary)
Secondary:  #XXXXXX  (used as --secondary)
Surface:    #XXXXXX  (used as --surface-light, --surface-dark)
Background: #XXXXXX  (used as --background, --background-dark)
```

---

## Phase 2: Foundation Setup

Do these before creating any page components.

### 2.1 Exclude Template Folder from TypeScript

Add the template folder to `tsconfig.json` `exclude` array. Otherwise the Vite config files inside the templates will cause build errors:

```json
{
  "exclude": [
    "node_modules",
    "gemini-design"
  ]
}
```

### 2.2 Replace globals.css

Create a new `globals.css` that defines:

**a) Tailwind theme inline block** - Maps CSS variables to Tailwind color names:

```css
@theme inline {
  --font-sans: "Inter", system-ui, sans-serif;
  --color-primary: var(--primary);
  --color-secondary: var(--secondary);
  --color-surface-light: var(--surface-light);
  --color-surface-dark: var(--surface-dark);
  --color-background-dark: var(--background-dark);
  /* ... all colors used in templates */
}
```

**b) `:root` block** - Defines the actual color values:

```css
:root {
  --primary: #008080;
  --secondary: #4CAF50;
  --surface-light: #F0F9F9;
  --surface-dark: #1e293b;
  --background-dark: #0f172a;
  /* ... */
}
```

**c) `.dark` block** - Dark mode overrides:

```css
.dark {
  --primary: #2dd4bf;
  --secondary: #4ade80;
  --background: #0f172a;
  /* ... */
}
```

**Why this matters:** Templates use classes like `text-primary`, `bg-surface-light`, `dark:bg-surface-dark`. If these aren't defined in the Tailwind theme, they silently produce no output.

### 2.3 Update layout.tsx

The root layout needs these changes:

**a) Import new shared components** (SiteHeader, SiteFooter, FloatingCTA) instead of old ones.

**b) Add Material Symbols font** if templates use it (look for `material-symbols-outlined` in template code):

```tsx
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
/>
```

**c) Add dark mode support** with `next-themes`:

```tsx
import { ThemeProvider } from 'next-themes';

// In the body:
<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
  {children}
</ThemeProvider>
```

**d) Add `suppressHydrationWarning`** to `<html>` tag (required by next-themes).

**e) Update metadata** (title, description, openGraph) to match new site.

### 2.4 Create Shared Components

From the templates, extract and create:

- **SiteHeader.tsx** (`'use client'`) - Merge TopBar + Navbar from templates. Use `useTheme()` from `next-themes` for dark mode toggle instead of the template's raw `document.documentElement.classList` approach.
- **SiteFooter.tsx** (`'use client'` if it has forms/handlers) - Single footer from templates. Use `next/link` for internal navigation.
- **FloatingCTA.tsx** (`'use client'`) - If templates have a floating action button.

---

## Phase 3: Vite React to Next.js Conversion

Every template component needs these conversions. Apply them systematically.

### 3.1 Client vs Server Components

| Component has... | Directive needed |
|-------------------|-----------------|
| `useState`, `useEffect` | `'use client'` |
| `onClick`, `onChange`, `onSubmit` | `'use client'` |
| `useTheme()` or other hooks | `'use client'` |
| Only props, JSX, no interactivity | None (server component) |

**Rule:** Page files (`page.tsx`) should stay as server components. They compose client components.

### 3.2 Conversion Checklist

For every template component, apply these transformations:

```
[ ] Add 'use client' if component uses hooks or event handlers
[ ] Replace <a href="/..."> with <Link href="/..."> from next/link
[ ] Replace <a href="#">  with <Link href="/relevant-route">
[ ] Replace <img> with <Image> from next/image (where sizes are known)
    - For external URLs: add domain to next.config.js remotePatterns, or use unoptimized
    - For unknown/dynamic URLs: keep <img> (acceptable, just triggers ESLint warning)
[ ] Escape special characters in JSX:
    - ' → &apos;  (inside JSX text)
    - " → &quot;  (inside JSX text)
    - & → &amp;   (if not already an entity)
[ ] Remove dark mode toggle logic (useState + document.documentElement)
    - Dark mode is handled globally by next-themes in layout.tsx
    - Remove darkMode prop passing from App.tsx
[ ] Remove Navbar/Footer imports (handled by layout.tsx)
[ ] Change named exports to default exports if needed
[ ] Remove React import (not needed in Next.js with automatic JSX runtime)
```

### 3.3 Template App.tsx → page.tsx

Each template's `App.tsx` shows the page composition order. Convert it to a `page.tsx`:

**Template App.tsx:**
```tsx
const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  // ... dark mode logic
  return (
    <div>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <Hero />
      <Features />
      <Testimonials />
      <Footer />
    </div>
  );
};
```

**Converted page.tsx:**
```tsx
import Hero from '@/components/mysite/landing/Hero';
import Features from '@/components/mysite/landing/Features';
import Testimonials from '@/components/mysite/landing/Testimonials';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Testimonials />
    </>
  );
}
```

Note: Navbar, Footer, dark mode logic are all removed (handled by layout.tsx).

### 3.4 Component File Structure

Organize components by page under a namespace folder:

```
components/{namespace}/
  SiteHeader.tsx          # Shared header
  SiteFooter.tsx          # Shared footer
  FloatingCTA.tsx         # Shared floating button
  landing/                # Homepage components
    Hero.tsx
    Features.tsx
    Testimonials.tsx
  contact/                # Contact page components
    Hero.tsx
    ContactForm.tsx
  about/                  # About page components
    Hero.tsx
    Timeline.tsx
    Team.tsx
  blog/                   # Blog listing components
    Hero.tsx
    ArticleGrid.tsx
    Sidebar.tsx
```

---

## Phase 4: Page Implementation

### 4.1 Implementation Order

1. **Homepage** first - validates the entire foundation (colors, layout, fonts)
2. **Other static pages** (about, contact, blog listing) - can be done in parallel
3. **Dynamic pages** (blog/[slug]) - after static pages verify the pattern works
4. **New routes** (pages that didn't exist before)

### 4.2 For Each Page

1. Read the template's `App.tsx` to understand component composition and ordering
2. Read each component file in the template's `components/` folder
3. Create converted components in `components/{namespace}/{page}/`
4. Create or replace `app/{route}/page.tsx`
5. Skip Navbar.tsx and Footer.tsx from template (already shared)

---

## Phase 5: Cleanup

### 5.1 Delete Old Routes

Remove folders for routes that have no matching template and aren't in the "keep" list:

```bash
rm -rf app/old-route-1 app/old-route-2 app/old-route-3
```

### 5.2 Update Supporting Files

| File | Changes |
|------|---------|
| `app/sitemap.ts` | Remove deleted routes, add new routes, update base URL |
| `app/not-found.tsx` | Restyle with new color scheme, update language/text |
| `app/loading.tsx` | Update spinner colors to match new theme |
| `app/error.tsx` | Restyle with new color scheme, update language/text |
| `app/robots.ts` | Update if domain changed |

### 5.3 Keep Backend Intact

Do NOT modify:
- `lib/` folder (API functions, database clients, utilities)
- `app/api/` routes (backend endpoints)
- `middleware.ts`
- `components/ui/` (shared UI library like shadcn)
- Environment variables and config files

---

## Phase 6: Build Verification

### 6.1 Run the Build

```bash
npm run build
```

### 6.2 Common Build Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot find module 'vite'` | Template folder included in TS compilation | Add template folder to `tsconfig.json` `exclude` |
| `Event handlers cannot be passed to Client Component props` | Component with `onSubmit`/`onClick` missing directive | Add `'use client'` at top of file |
| `Cannot find module '@/types/...'` | Pre-existing missing type files | Create stub type declarations |
| `<img> could result in slower LCP` | ESLint warning, not an error | Acceptable; convert to `next/image` optionally |
| `'` can be escaped with `&apos;` | Unescaped quotes in JSX | Replace `'` with `&apos;` in JSX text content |

### 6.3 Verification Checklist

```bash
# Confirm deleted routes are gone
ls app/old-route-name  # should not exist

# Search for old project name references
grep -ri "old-project-name" app/ components/ --include="*.tsx" --include="*.ts"

# Search for broken imports to deleted components
grep -ri "from.*old-component" app/ components/ --include="*.tsx"

# Verify build succeeds
npm run build

# Start dev server and check each page visually
npm run dev
```

---

## Quick Reference: Gemini Template Patterns

Patterns you'll find in every Gemini template and how to handle them:

| Gemini Template Pattern | Next.js Conversion |
|-------------------------|-------------------|
| `useState` for dark mode in App.tsx | Remove entirely, use `next-themes` in layout |
| `<Navbar darkMode={darkMode} toggleDarkMode={...} />` | Remove, use shared SiteHeader with `useTheme()` |
| `<Footer />` in every App.tsx | Remove, use shared SiteFooter in layout |
| `<a href="#">` placeholder links | Replace with `<Link href="/actual-route">` |
| `document.documentElement.classList.add('dark')` | Remove, handled by `next-themes` ThemeProvider |
| `className="material-symbols-outlined"` | Works as-is if font loaded via `<link>` in layout |
| Inline `style={{ backgroundImage: '...' }}` | Keep as-is, works in Next.js |
| `export default App` in App.tsx | Becomes the composition in `page.tsx` |
| Vite `index.tsx` entry point | Ignore, not needed in Next.js |
| `vite.config.ts` | Ignore, not needed in Next.js |

---

## Summary

The migration has 6 phases:

1. **Plan** - Map templates to routes, identify what to keep/delete/create
2. **Foundation** - globals.css colors, layout.tsx, shared components, tsconfig exclusion
3. **Convert** - Apply Vite→Next.js transformations to every component
4. **Implement** - Create page components and page.tsx files
5. **Cleanup** - Delete old routes, update supporting files
6. **Verify** - Build, check each page, search for stale references
