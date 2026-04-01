# Getting Started with @mkuesta packages

## What this is

A collection of 25 npm packages for building Next.js websites with Directus CMS. Handles blog, products, SEO, payments, auth, email, search, and more — so you focus on the site-specific parts.

## Quick overview

```
@mkuesta/core         Blog, settings, content pipeline, caching
@mkuesta/products     Product catalog, pricing, categories
@mkuesta/seo          Schema.org generators, meta tags, canonical URLs
@mkuesta/sitemap      Sitemap XML + robots.txt generation
@mkuesta/admin        In-app admin UI + API with JWT auth
@mkuesta/search       Site-wide search with weighted scoring
@mkuesta/forms        Form submissions with spam protection
@mkuesta/preview      Draft preview + scheduled publishing
@mkuesta/webhooks     Directus webhook receiver for ISR
@mkuesta/analytics    GTM, GA4, Pixel, Hotjar, Clarity
@mkuesta/tags         Tag taxonomy + tag cloud
@mkuesta/email        Transactional email via Resend
@mkuesta/newsletter   Email subscriptions + double opt-in
@mkuesta/media        Responsive images, galleries, blur placeholders
@mkuesta/navigation   Menus by slug, nested items
@mkuesta/redirects    URL redirects with regex matching
@mkuesta/banners      Announcement/promo banners
@mkuesta/i18n         Translations + locale fallback
@mkuesta/pages        Dynamic pages with content processing
@mkuesta/notifications Toast notification system
@mkuesta/stripe       Stripe checkout, orders, webhooks
@mkuesta/auth         Supabase auth (login, signup, OAuth)
@mkuesta/cache        Shared WeakMap-based caching
@mkuesta/cart         Shopping cart context
@mkuesta/testing      Test utilities and mocks
```

---

## Option A: Create a brand new site

### 1. Copy the starter template

```bash
cd /path/to/directus-cms-monorepo
cp -r sites/starter sites/my-new-site
cd sites/my-new-site
```

### 2. Configure your site

Edit `lib/directus/config.ts` — change these 4 values:

```typescript
export const SITE_NAME = 'My Site';        // Your site name
const PREFIX = 'mysite';                    // Directus collection prefix
export const BLOG_ROUTE = 'blog';           // Must match app/ folder name
export const PRODUCT_ROUTE = 'products';    // Must match app/ folder name
```

### 3. Provision Directus collections

```bash
# From monorepo root
cd packages/provision-directus-site && npm run build
node dist/index.js \
  --url https://cms.drlogist.com \
  --token YOUR_ADMIN_TOKEN \
  --prefix mysite \
  --all
```

This creates all collections (posts, products, categories, settings, etc.) with the correct fields.

### 4. Create `.env.local`

```bash
cp .env.example .env.local
```

Fill in:
```env
NEXT_PUBLIC_DIRECTUS_URL=https://cms.drlogist.com
DIRECTUS_STATIC_TOKEN=your_read_only_token
DIRECTUS_TOKEN=your_admin_write_token
NEXT_PUBLIC_BASE_URL=https://mysite.com
```

### 5. Deploy

```bash
# Create GitHub repo
git init && git add -A && git commit -m "init"
gh repo create Mkuesta/My-New-Site --public --source=.
git push -u origin main

# Deploy to Vercel
vercel

# Set env vars on Vercel
vercel env add NEXT_PUBLIC_DIRECTUS_URL production
vercel env add DIRECTUS_STATIC_TOKEN production
vercel env add DIRECTUS_TOKEN production
vercel env add NEXT_PUBLIC_BASE_URL production
```

### 6. Post-deploy setup

1. Upload a default OG image in Directus → `mysite_settings` → `default_og_image`
2. Set up scheduled publishing Directus Flow (see `packages/preview/SCHEDULING.md`)
3. Generate a sitemap slug: `node -e "console.log('sm-'+require('crypto').randomBytes(4).toString('hex')+'.xml')"`
4. Set `SITEMAP_SLUG` env var on Vercel
5. Submit sitemap URL to Google Search Console

---

## Option B: Add packages to an existing site (without changing layout)

The key principle: **add packages alongside existing code, don't replace anything**.
Create a new `lib/cms-packages.ts` file — don't modify existing `lib/directus.ts`.
Migrate one page at a time, or just use packages for new features (scheduling, sitemap).

### 1. Configure npm registry

Create `.npmrc` in your site root with the GitHub Packages token:
```
@mkuesta:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=ghp_YOUR_PAT_HERE
```

**IMPORTANT:** The token must be hardcoded (not `${NPM_TOKEN}`). Vercel does NOT substitute env vars in `.npmrc` during `npm install`. This is safe as long as your site repo is **private** on GitHub.

Generate a PAT at https://github.com/settings/tokens/new with only `read:packages` scope.

### 2. Install only the packages you need

```bash
# Set token locally for install
export NPM_TOKEN=ghp_YOUR_PAT_HERE

# Start small — add what you need
npm install @mkuesta/core @mkuesta/seo @mkuesta/sitemap @mkuesta/preview
```

### 3. Create a SEPARATE config file (don't modify existing code)

Create `lib/cms-packages.ts` alongside your existing `lib/directus.ts`:

```typescript
// lib/cms-packages.ts — @mkuesta package clients
// Existing lib/directus.ts stays untouched
import { createDirectus, rest, staticToken } from '@directus/sdk';
import { createCmsClient } from '@mkuesta/core';
import { createSeoClient } from '@mkuesta/seo';
import { createPreviewClient } from '@mkuesta/preview';
import { DIRECTUS_URL, DIRECTUS_TOKEN, COLLECTIONS } from './directus/config';

const directus = createDirectus(DIRECTUS_URL)
  .with(staticToken(DIRECTUS_TOKEN))
  .with(rest());

export const cms = createCmsClient({
  directus,
  collections: { ...COLLECTIONS },  // reuse existing config
  siteName: 'My Site',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://mysite.com',
  directusUrl: DIRECTUS_URL,
  route: 'blog',
});

export const preview = createPreviewClient({
  directus,
  directusUrl: DIRECTUS_URL,
  collections: { posts: COLLECTIONS.posts },
  previewSecret: process.env.PREVIEW_SECRET || '',
});
```

### 4. Add new features without touching existing pages

Packages are great for adding features the site doesn't have yet:

```
app/api/cron/publish/route.ts  → scheduled publishing (NEW)
app/api/sitemap/route.ts       → package-powered sitemap (NEW)
```

Keep existing pages untouched. Only use packages in new routes.

### 5. Gradual migration (optional, per-page)

When you want to improve an existing page's SEO, swap one function at a time:

```typescript
// Before (custom code)
import { getPostBySlug } from '@/lib/directus/blog';

// After (package)
import { cms } from '@/lib/cms-packages';
const post = await cms.getPostBySlug(slug);
```

The package returns the same data shape, so components usually work without changes.

### 4. Add missing Directus fields

```bash
npx provision-directus-site \
  --url https://cms.drlogist.com \
  --token YOUR_ADMIN_TOKEN \
  --prefix yourprefix \
  --all \
  --dry-run
```

Review output, then run without `--dry-run`. It skips existing collections/fields.

### 5. Audit existing content

Check if SEO fields are filled:
```bash
curl -H "Authorization: Bearer TOKEN" \
  "https://cms.drlogist.com/items/yourprefix_posts?limit=1&fields=seo_title,seo_description,published_date"
```

If empty, see "Fixing incomplete data" section below.

### 6. Create page files

Use `sites/starter/app/` as reference:
- `app/blog/page.tsx` — blog listing
- `app/blog/[slug]/page.tsx` — blog detail with ArticleSchema
- `app/products/[slug]/page.tsx` — product detail with Product JSON-LD
- `app/api/cron/publish/route.ts` — scheduled publishing
- `app/api/sitemap/route.ts` — obfuscated sitemap
- `app/robots.ts` — robots.txt without sitemap reference

---

## Option C: Update a package

```bash
# 1. Edit in monorepo
cd /path/to/directus-cms-monorepo
vim packages/core/src/blog.ts

# 2. Build
npx turbo run build --filter=@mkuesta/core

# 3. Test
cd e2e-test && npm test

# 4. Publish
npx changeset              # describe what changed
npx changeset version      # bump version numbers
npm run publish-packages   # publish to GitHub Packages

# 5. Update in your site
cd /path/to/my-site
npm update @mkuesta/core
```

---

## Fixing incomplete Directus data

### Truncated descriptions
Package auto-generates from title when `seo_description` is missing or truncated. But better to fix in Directus:
```bash
# Batch update via API
curl -X PATCH -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  "https://cms.drlogist.com/items/mysite_products/ITEM_ID" \
  -d '{"seo_description": "Your complete description here."}'
```

### Missing OG image
Upload one image to Directus, set as `default_og_image` in your settings collection. All pages use it as fallback.

### Missing published dates
```bash
# Set published_date = date_created for all posts
# (or use the Directus admin UI)
```

### Field name mismatches
If your Directus fields differ from what packages expect:
```typescript
const productCms = createProductClient({
  // ...
  fieldMapping: {
    products: {
      title: 'name',           // Directus has 'name', package expects 'title'
      featured: 'is_featured', // Directus has 'is_featured', package expects 'featured'
    },
  },
});
```

### Non-English FAQ extraction
FAQ extraction only works with English headings ("Frequently Asked Questions" / "FAQ"). For other languages, use the `faqs_json` field in Directus:
```json
[
  {"question": "Häufig gestellte Frage?", "answer": "Die Antwort."},
  {"question": "Noch eine Frage?", "answer": "Noch eine Antwort."}
]
```

---

## Critical gotchas

| Gotcha | What happens | Fix |
|--------|-------------|-----|
| `.npmrc` with `${NPM_TOKEN}` on Vercel | Install fails — env var not substituted | Hardcode token in `.npmrc` (keep repo private) |
| `gho_` token in `.npmrc` | "not a legal HTTP header value" | Must use `ghp_` Personal Access Token |
| `siteId` on collections without `site` column | Queries return 0 results silently | Don't set `siteId` |
| `productRoute` doesn't match `app/` path | Sitemap URLs return 404 | Make them match exactly |
| `DIRECTUS_TOKEN` is read-only | Scheduling can't publish | Use admin write token |
| `NEXT_PUBLIC_BASE_URL` has trailing `\n` | JSON-LD URLs broken | All packages `.trim()` it now |
| Directus Flows `item-update` unreliable | Scheduled content never publishes | Use webhook → API endpoint approach |
| `og:type=product` via Next.js Metadata | Renders wrong HTML attribute | Use `<ProductOGMeta>` component |
| `</script>` in CMS content | XSS in JSON-LD | Package escapes it now |
| Replacing existing site with starter template | Breaks all styling/layout | Use Option B — add packages alongside existing code |

---

## Environment variables reference

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_DIRECTUS_URL` | Yes | Directus instance URL |
| `DIRECTUS_STATIC_TOKEN` | Yes | Read-only token for fetching content |
| `DIRECTUS_TOKEN` | For scheduling | Admin write token |
| `NEXT_PUBLIC_BASE_URL` | Yes | Your site's canonical URL |
| `SITEMAP_SLUG` | Recommended | Random sitemap path (e.g. `sm-abc12345.xml`) |
| `STRIPE_SECRET_KEY` | For payments | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | For payments | Stripe webhook signing secret |
| `RESEND_API_KEY` | For email | Resend API key |
| `EMAIL_FROM` | For email | Sender address |
| `NEXT_PUBLIC_SUPABASE_URL` | For auth/data | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For auth/data | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | For auth/data | Supabase service role key |
| `ADMIN_PASSWORD` | For admin UI | Admin panel password |
| `ADMIN_SECRET` | For admin UI | JWT signing secret |
| `PREVIEW_SECRET` | For preview | HMAC preview signing secret |
| `CRON_SECRET` | Optional | Protects cron endpoint |

---

## File structure of a typical site

```
my-site/
├── .npmrc                          # @mkuesta registry config
├── .env.local                      # secrets (gitignored)
├── .env.example                    # template for .env.local
├── next.config.ts                  # rewrites for obfuscated sitemap
├── vercel.json                     # cron config
├── lib/
│   ├── directus/config.ts          # collection names, routes, site identity
│   ├── cms.ts                      # CMS + product clients
│   ├── seo.ts                      # SEO client
│   ├── sitemap.ts                  # sitemap client
│   └── preview.ts                  # preview/scheduling client
├── app/
│   ├── layout.tsx                  # global layout + Organization/WebSite JSON-LD
│   ├── page.tsx                    # homepage
│   ├── robots.ts                   # robots.txt (no sitemap reference)
│   ├── blog/
│   │   ├── page.tsx                # blog listing
│   │   └── [slug]/page.tsx         # blog detail + ArticleSchema
│   ├── products/
│   │   └── [slug]/page.tsx         # product detail + Product JSON-LD
│   ├── api/
│   │   ├── cron/publish/route.ts   # scheduled publishing endpoint
│   │   └── sitemap/route.ts        # sitemap XML (served at random URL)
│   └── ...
└── package.json
```
