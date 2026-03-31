# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

Each package is built independently with tsup. There is no workspace-level build.

```bash
# Build a specific package
cd directus-cms-core && npm run build
cd directus-cms-admin && npm run build
cd directus-cms-products && npm run build

# Watch mode for development
cd <package> && npm run dev
```

**Build order matters:** `directus-cms-core` must be built before `directus-cms-products`, `directus-cms-pages`, and `directus-cms-sitemap` (they depend on core via `file:../directus-cms-core`).

CLI packages (`create-directus-site`, `deploy-directus-site`, `provision-directus-site`, `setup-directus-site`, `validate-directus-site`) are also built with tsup.

### Tests

```bash
# Run e2e tests
cd e2e-test && npm test

# Run tests against a live Directus instance
cd e2e-test && npm run test:live
```

## Architecture

24 CMS packages, 5 CLI tools, and an e2e test suite providing Directus CMS integration for Next.js sites.

### CMS Packages

#### `@directus-cms/core` — Blog/content infrastructure
- Factory: `createCmsClient(config)` returns a bound client with methods for posts, categories, settings, images, metadata, and static params
- Content pipeline: Markdown/HTML → sanitized HTML with heading IDs, FAQ/table/list extraction
- Schema.org JSON-LD via `<ArticleSchema>` component
- 60-second WeakMap-based caching for settings and category lookups

#### `@directus-cms/admin` — In-app admin UI + API
- `createAdminApiHandler()` factory creates a single catch-all Next.js route handler for `/admin/api/[...path]`
- Routes: auth (login/logout/check), articles CRUD, products CRUD (optional), settings, categories, file upload
- Zero-dependency JWT auth using Web Crypto API (HS256, 24h expiry)
- All UI components are client components (tsup injects `"use client"` banner)
- Auth via `ADMIN_PASSWORD` env var

#### `@directus-cms/products` — Product catalog with multi-tenancy
- Factory: `createProductClient(config)` with siteId-based tenant filtering
- Depends on `@directus-cms/core` for content processing and extraction utilities
- Client-side pagination (fetches all items, paginates in JS) due to Directus Public role limitations
- Schema.org JSON-LD via `<ProductSchema>` and `<CategoryListSchema>` components

#### `@directus-cms/analytics` — Tracking & consent
- `createAnalyticsClient()`: tracking config (GTM, GA4, Pixel, Hotjar, Clarity), cookie consent settings
- Components: `GtmScript`, `Ga4Script`, `GtmNoScript`

#### `@directus-cms/banners` — Announcement/promo banners
- `createBannerClient()`: banners with date range, page targeting (wildcard patterns), dismissible flag

#### `@directus-cms/forms` — Form submissions
- `createFormClient()`: form submissions with honeypot spam detection, IP rate limiting
- `createApiHandler()` for Next.js API routes

#### `@directus-cms/i18n` — Internationalization
- `createI18nClient()`: translations with `t()` lookup, locale fallback chain, alternate links for hreflang, 30+ locale definitions

#### `@directus-cms/media` — Responsive images & galleries
- `createMediaClient()`: responsive images (`getSrcSet`, `getResponsiveImage`), blur placeholders, gallery management

#### `@directus-cms/navigation` — Menus
- `createNavigationClient()`: menus by slug, nested items via parent_id, header/footer convenience methods

#### `@directus-cms/pages` — Dynamic pages
- `createPageClient()`: dynamic pages with content processing, page tree hierarchy, SEO metadata
- Depends on `@directus-cms/core`

#### `@directus-cms/redirects` — URL redirects
- `createRedirectClient()`: URL redirects with regex matching, configurable HTTP status codes (301/302/307/308)

#### `@directus-cms/sitemap` — Sitemap & robots.txt
- `createSitemapClient()`: XML sitemap + robots.txt generation, segmentation, hreflang alternates
- Optional dependencies on core and products

#### `@directus-cms/cache` — Shared caching utilities
- `createCache<T>()`: WeakMap-backed cache with configurable TTL, expiry-on-read (no timers)
- `withCache()`: cache-aside helper, `withCacheSWR()`: stale-while-revalidate
- Zero dependencies, designed to replace duplicated caching across packages

#### `@directus-cms/testing` — Test utilities and mocks
- `createMockDirectus()`: mock Directus client intercepting `request()` calls
- Config factories: `createMockCmsConfig()`, `createMockProductConfig()`, etc.
- Fixture builders: `createPost()`, `createProduct()`, `createBlogCategory()`, etc.
- `expectJsonLd()`: assertion helper for Schema.org structured data
- Peer dep: vitest

#### `@directus-cms/seo` — SEO & structured data
- `createSeoClient()`: Schema.org generators (BreadcrumbList, Organization, WebSite, HowTo, Event, FAQPage, LocalBusiness, VideoObject)
- `generateMetaTags()`: Open Graph, Twitter Card, canonical URL helpers
- Components: `<JsonLd>`, `<MetaTags>`
- No `@directus/sdk` dependency (pure generation/rendering)

#### `@directus-cms/search` — Site-wide search
- `createSearchClient()`: search across posts, products, pages using Directus `_icontains` filters
- Weighted field scoring (title > content > excerpt), snippet extraction with highlighting
- Component: `<SearchResults>` with query term highlighting

#### `@directus-cms/tags` — Tag taxonomy
- `createTagClient()`: tag extraction from posts' JSON `tags` field
- `getAllTags()`, `getPostsByTag()`, `getRelatedByTags()`, `getTagCounts()`
- Components: `<TagCloud>`, `<TagList>`

#### `@directus-cms/preview` — Draft preview & scheduling
- `createPreviewClient()`: draft content fetching (admin token), HMAC-signed preview URLs
- `createPreviewApiHandler()`, `createExitPreviewHandler()`: Next.js draft mode integration
- `getScheduledContent()`, `publishScheduledContent()`: scheduled publishing
- Component: `<PreviewBanner>` (client component with "use client" banner)

#### `@directus-cms/webhooks` — Webhook receiver & ISR
- `createWebhookHandler()`: Next.js route handler for Directus webhook events
- HMAC signature validation, collection-to-action mapping (exact + wildcard)
- Built-in `revalidatePath`/`revalidateTag` actions + custom handlers
- `defaultCollectionMappings(prefix)`: sensible defaults for all content types

#### `@directus-cms/stripe` — Payments & orders via Stripe
- `createStripeClient(config)`: Checkout Sessions, order management, product sync
- `createCheckoutApiHandler()`, `createStripeWebhookHandler()`: Next.js API routes
- Components: `<CheckoutButton>`, `<OrderStatus>`
- **External SDK:** `stripe` (Stripe Node.js SDK)
- Directus collection: `{prefix}_orders`

#### `@directus-cms/auth` — User authentication via Supabase
- `createAuthClient(config)`: signUp, signIn, signInWithOAuth, signOut, profiles
- `createAuthMiddleware()`: protected route middleware
- `createAuthCallbackHandler()`: OAuth redirect handler
- Components: `<AuthProvider>`, `<LoginForm>`, `<SignUpForm>`, `<UserMenu>`
- **External SDK:** `@supabase/supabase-js` (Supabase JS SDK)
- Directus collection: `{prefix}_user_profiles`

#### `@directus-cms/email` — Transactional email via Resend
- `createEmailClient(config)`: send emails, template rendering, optional logging
- `sendFormNotification()`, `sendOrderConfirmation()`: pre-built notification helpers
- `createEmailApiHandler()`: Next.js API route
- **External SDK:** `resend` (Resend Node.js SDK)
- Directus collections: `{prefix}_email_templates`, `{prefix}_email_log`

#### `@directus-cms/newsletter` — Email subscription management
- `createNewsletterClient(config)`: subscribe, confirm (double opt-in), unsubscribe, subscriber listing
- Honeypot spam detection, IP rate limiting (same pattern as forms)
- `createApiHandler()`: Next.js route handler (POST for subscribe/confirm/unsubscribe, GET for confirmation links)
- Optional integration with `@directus-cms/email` for sending confirmation emails
- Component: `<SubscribeForm>` (client component with "use client" banner)
- Directus collection: `{prefix}_subscribers`

#### `@directus-cms/notifications` — Toast notifications & user feedback
- `createNotificationClient(config)`: optional CMS-managed notification templates
- `useNotification()` hook: `notify()`, `success()`, `error()`, `info()`, `warning()`, `dismiss()`
- Components: `<NotificationProvider>` (context wrapper), `<Toast>` (individual notification)
- Purely client-side toast system — no Directus backend required for basic usage
- Optional CMS templates via `{prefix}_notification_templates` collection
- Configurable position, duration, max visible count
- Minimal inline styles (no external CSS dependency)

### External Services & SDKs

| Service | SDK (npm) | Purpose | Env Vars | CLI |
|---------|-----------|---------|----------|-----|
| **Directus** | `@directus/sdk` | CMS backend, all data | `DIRECTUS_STATIC_TOKEN`, `NEXT_PUBLIC_DIRECTUS_URL` | None (custom `provision-directus-site`) |
| **Stripe** | `stripe` | Payments, checkout, orders | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `stripe` CLI (local webhook testing only) |
| **Supabase** | `@supabase/supabase-js` | User auth, OAuth, sessions | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Not needed (SDK only) |
| **Resend** | `resend` | Transactional email | `RESEND_API_KEY`, `EMAIL_FROM` | No CLI exists |
| **Vercel** | — | Hosting, deployment | Via `vercel` CLI | `vercel` (deploy, env vars, link) |

### CLI Tools

- **`create-directus-site`** — Scaffolds a new Next.js project with selected features, generates configs/routes/middleware
- **`deploy-directus-site`** — Deploys to Vercel, manages env vars, links project
- **`provision-directus-site`** — Provisions Directus collections/fields/permissions/relations, optional seed data, dry-run mode
- **`setup-directus-site`** — Combined setup: scaffolds, provisions, and deploys in one step
- **`validate-directus-site`** — Health check CLI: validates collections, fields, relations, permissions, settings, env vars, optional data integrity

### Test Suite

- **`e2e-test`** — Vitest-based tests covering provisioning, scaffolding, content pipeline, deploy helpers, and full integration pipeline

### Dependency graph
```
cache (no deps — shared utility)
core (no internal deps)
├── products → core
├── pages → core
└── sitemap → core (optional), products (optional)
testing → core (for types, devDep only)
admin (independent)
analytics, banners, forms, i18n, media, navigation, redirects (all independent)
seo, search, tags, preview, webhooks, notifications (all independent)
newsletter → email (optional)
stripe → stripe SDK (external)
auth → @supabase/supabase-js (external)
email → resend SDK (external)
CLI tools: create-directus-site, deploy-directus-site, provision-directus-site (all independent)
setup-directus-site → create-directus-site + provision-directus-site + deploy-directus-site
validate-directus-site → provision-directus-site
```

## Key Patterns

- **Factory pattern everywhere**: All packages use `createXxxClient(config)` that binds a config object through all functions. Config carries the Directus SDK client instance, collection names, and site-specific settings.
- **Directus SDK usage**: `@directus/sdk` with `createDirectus().with(rest())`. Queries use `readItems`, `readItem`, `readSingleton`, `updateItem`, `updateSingleton` with explicit field selection (no wildcards).
- **Transformation layer**: Raw Directus types (`DirectusPost`, `DirectusProductFull`) are transformed to consumer-friendly camelCase types (`Post`, `Product`) at the boundary.
- **Two export paths per package**: Main (`./`) for logic/types, `./components` for React components. Both are defined in package.json `exports` and built as separate tsup entry points.
- **ESM only**: All packages use `"type": "module"` with ESM-only output.
- **Content format detection**: Functions detect whether content is Markdown or HTML by checking for HTML tags, then process accordingly.
- **60-second WeakMap caching**: Used across most packages (not just core) for settings and lookup caching.
- **Multi-tenant siteId filtering**: Used across most packages (not just products) to scope queries to a specific site.
- **CLI shebang banner**: CLI tools use tsup with `#!/usr/bin/env node` banner for direct execution.
