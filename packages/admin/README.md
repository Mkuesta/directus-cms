# @directus-cms/admin

In-app admin UI for Directus CMS-powered Next.js sites. Provides login, article editing, product editing, settings management, markdown preview, and image uploads — all behind a password-protected admin area.

## Prerequisites

- Next.js 14+ (App Router)
- Tailwind CSS (all components use Tailwind classes)
- A Directus instance with your collections set up
- `@directus/sdk` installed in your site

## Installation

```bash
# From within your site directory
npm install ../../directus-cms-admin --legacy-peer-deps
```

Or add to `package.json`:

```json
{
  "dependencies": {
    "@directus-cms/admin": "file:../../directus-cms-admin"
  }
}
```

## Setup

### 1. Environment Variables

Add to `.env.local` and your Vercel project settings:

```env
# Required — the password users enter to access /admin
ADMIN_PASSWORD=choose-a-strong-password

# Required — random string used to sign session cookies (generate with: openssl rand -hex 32)
ADMIN_SECRET=a-random-32-character-string

# These should already exist in your site
NEXT_PUBLIC_DIRECTUS_URL=https://cms.drlogist.com
DIRECTUS_STATIC_TOKEN=your-directus-token
```

### 2. Admin Config

Create `lib/admin-config.ts` in your site:

```ts
import { createDirectus, rest, staticToken } from '@directus/sdk';
import type { AdminConfig } from '@directus-cms/admin';

// Change this per site (e.g. 'stopabo_de', 'falwo_nl', 'resiliax_fr')
const COLLECTION_PREFIX = 'stopabo_de';

export const adminConfig: AdminConfig = {
  directus: createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
    .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN!))
    .with(rest()),
  directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
  directusToken: process.env.DIRECTUS_STATIC_TOKEN!,
  collections: {
    posts: `${COLLECTION_PREFIX}_posts`,
    settings: `${COLLECTION_PREFIX}_settings`,
    blogCategories: `${COLLECTION_PREFIX}_blog_categories`,
  },
  siteName: 'StopAbo', // change per site
  adminSecret: process.env.ADMIN_SECRET!,
};
```

**For sites with products**, add the product collections:

```ts
export const adminConfig: AdminConfig = {
  // ...same as above, plus:
  collections: {
    posts: `${COLLECTION_PREFIX}_posts`,
    settings: `${COLLECTION_PREFIX}_settings`,
    blogCategories: `${COLLECTION_PREFIX}_blog_categories`,
    products: `${COLLECTION_PREFIX}_products`,
    productCategories: `${COLLECTION_PREFIX}_categories`,
  },
  siteId: 4, // for multi-tenant product filtering
};
```

### 3. API Route

Create the catch-all API handler that all admin components talk to.

**`app/admin/api/[...path]/route.ts`**

```ts
import { createAdminApiHandler } from '@directus-cms/admin';
import { adminConfig } from '@/lib/admin-config';

const handler = createAdminApiHandler(adminConfig);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
```

### 4. Pages

Create the following pages under `app/admin/`:

**`app/admin/layout.tsx`** — Wraps all admin pages with sidebar navigation and auth guard.

```tsx
import { AdminLayout } from '@directus-cms/admin/components';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayout siteName="StopAbo">
      {children}
    </AdminLayout>
  );
}
```

> Set `hasProducts={true}` if your site has products to show the Products nav link.

**`app/admin/page.tsx`** — Redirects to the articles list.

```tsx
import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/admin/articles');
}
```

**`app/admin/login/page.tsx`** — Login page (shown when not authenticated).

```tsx
import { LoginForm } from '@directus-cms/admin/components';

export default function Page() {
  return <LoginForm siteName="StopAbo" />;
}
```

**`app/admin/articles/page.tsx`** — Articles list.

```tsx
import { ArticlesList } from '@directus-cms/admin/components';

export default function Page() {
  return <ArticlesList />;
}
```

**`app/admin/articles/[id]/page.tsx`** — Article editor.

```tsx
import { ArticleEditor } from '@directus-cms/admin/components';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ArticleEditor articleId={id} directusUrl={process.env.NEXT_PUBLIC_DIRECTUS_URL} />;
}
```

**`app/admin/settings/page.tsx`** — Site settings editor.

```tsx
import { SettingsEditor } from '@directus-cms/admin/components';

export default function Page() {
  return <SettingsEditor directusUrl={process.env.NEXT_PUBLIC_DIRECTUS_URL} />;
}
```

### 5. Product Pages (optional)

Only needed if your site has products.

**`app/admin/products/page.tsx`**

```tsx
import { ProductsList } from '@directus-cms/admin/components';

export default function Page() {
  return <ProductsList />;
}
```

**`app/admin/products/[id]/page.tsx`**

```tsx
import { ProductEditor } from '@directus-cms/admin/components';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductEditor productId={id} directusUrl={process.env.NEXT_PUBLIC_DIRECTUS_URL} currency="EUR" />;
}
```

## File Structure

After setup, your admin files should look like this:

```
your-site/
  lib/
    admin-config.ts
  app/
    admin/
      layout.tsx
      page.tsx
      login/
        page.tsx
      articles/
        page.tsx
        [id]/
          page.tsx
      settings/
        page.tsx
      products/          # optional
        page.tsx
        [id]/
          page.tsx
      api/
        [...path]/
          route.ts
```

## What Changes Per Site

| Setting | Example values |
|---------|---------------|
| `COLLECTION_PREFIX` | `stopabo_de`, `falwo_nl`, `resiliax_fr` |
| `siteName` | `"StopAbo"`, `"Falwo"`, `"Resiliax"` |
| `ADMIN_PASSWORD` | Different password per site |
| `ADMIN_SECRET` | Different secret per site |
| Products enabled | `hasProducts={true}` + product collections in config |
| `siteId` | Only needed for multi-tenant product filtering |

## API Routes Reference

All routes are under `/admin/api/` and require authentication (except auth routes).

| Route | Method | Description |
|-------|--------|-------------|
| `auth/login` | POST | Verify password, set session cookie |
| `auth/logout` | POST | Clear session cookie |
| `auth/check` | GET | Check if session is valid |
| `articles` | GET | List all articles |
| `articles/:id` | GET | Get single article |
| `articles/:id` | PUT | Update article |
| `products` | GET | List products (filtered by siteId) |
| `products/:id` | GET | Get single product |
| `products/:id` | PUT | Update product |
| `product-categories` | GET | List product categories |
| `settings` | GET | Read settings singleton |
| `settings` | PUT | Update settings singleton |
| `categories` | GET | List blog categories |
| `upload` | POST | Upload file to Directus (FormData) |

## Components Reference

Import all components from `@directus-cms/admin/components`:

| Component | Props | Description |
|-----------|-------|-------------|
| `LoginForm` | `siteName?` | Password login form |
| `AdminLayout` | `siteName?`, `hasProducts?`, `children` | Sidebar + auth guard wrapper |
| `ArticlesList` | — | Articles table with status badges |
| `ArticleEditor` | `articleId`, `directusUrl?` | Full article editor (content, SEO, social) |
| `ProductsList` | — | Products table with price, status |
| `ProductEditor` | `productId`, `directusUrl?`, `currency?` | Product editor with SEO article |
| `SettingsEditor` | `directusUrl?` | All site settings grouped by section |
| `MarkdownEditor` | `value`, `onChange`, `label?`, `rows?` | Edit/Preview toggle textarea |
| `ImageUpload` | `value?`, `directusUrl?`, `onChange`, `label?` | File upload with preview |

## Auth Flow

1. User visits `/admin` → `AdminLayout` checks for session cookie
2. No valid cookie → redirects to `/admin/login`
3. User enters password → `POST /admin/api/auth/login`
4. Password matches `ADMIN_PASSWORD` env var → sets `HttpOnly; Secure; SameSite=Strict` cookie (24h expiry)
5. All subsequent API requests are authenticated via the cookie
6. Sign out clears the cookie

## Security Notes

- Session cookies are `HttpOnly`, `Secure` (in production), and `SameSite=Strict`
- JWTs are signed with HMAC-SHA256 using the `ADMIN_SECRET`
- The Directus token stays server-side (never sent to the browser)
- File uploads are proxied through the API route to keep the token hidden
- Use a strong `ADMIN_PASSWORD` and unique `ADMIN_SECRET` per site
