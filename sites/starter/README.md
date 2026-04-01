# Starter Site Template

A ready-to-use Next.js site with all `@directus-cms/*` packages wired up.

## Quick start

```bash
# 1. Copy this folder for your new site
cp -r sites/starter sites/my-new-site

# 2. Update config
# Edit lib/directus/config.ts:
#   - SITE_NAME
#   - PREFIX (must match your Directus collection prefix)
#   - BLOG_ROUTE / PRODUCT_ROUTE (must match app/ directory names)

# 3. Provision Directus collections
npx provision-directus-site \
  --url https://cms.drlogist.com \
  --token YOUR_ADMIN_TOKEN \
  --prefix mysite \
  --all

# 4. Create .env.local from .env.example
cp .env.example .env.local
# Fill in your tokens

# 5. Install and run
cd ../..  # monorepo root
npm install
npm run dev -- --filter=my-new-site
```

## What's included

| Feature | Package | Route |
|---------|---------|-------|
| Blog listing | `@directus-cms/core` | `/blog` |
| Blog post detail | `@directus-cms/core` | `/blog/[slug]` |
| Product detail | `@directus-cms/products` | `/products/[slug]` |
| Scheduled publishing | `@directus-cms/preview` | `/api/cron/publish` |
| Sitemap (obfuscated) | `@directus-cms/sitemap` | `/api/sitemap` + rewrite |
| robots.txt | Built-in | `/robots.txt` |
| SEO meta tags | `@directus-cms/seo` | Via generateMetadata |
| JSON-LD schemas | `@directus-cms/core` + `seo` | ArticleSchema, Product |

## Customization checklist

1. [ ] Update `lib/directus/config.ts` — site name, prefix, routes
2. [ ] Update `app/layout.tsx` — add your header, footer, styles
3. [ ] Rename route folders if needed (e.g. `app/blog` → `app/resources`)
4. [ ] If you rename routes, update `BLOG_ROUTE`/`PRODUCT_ROUTE` in config
5. [ ] Add `SITEMAP_SLUG` to your env (generate once: `node -e "console.log('sm-'+require('crypto').randomBytes(4).toString('hex')+'.xml')"`)
6. [ ] Submit sitemap URL to Google Search Console
7. [ ] Set up Directus Flow for scheduled publishing (see `packages/preview/SCHEDULING.md`)

## Gotchas

- **Route/config mismatch**: `PRODUCT_ROUTE` in config MUST match the `app/` directory name. If products are at `app/shop/[slug]`, set `PRODUCT_ROUTE = 'shop'`
- **siteId**: Only set `SITE_ID` if your Directus collections have a `site` column. Otherwise leave `undefined` — queries silently return 0 results
- **DIRECTUS_TOKEN vs DIRECTUS_STATIC_TOKEN**: Static token is for reading (public). DIRECTUS_TOKEN needs write access (for preview, scheduling)
- **og:type=product**: Use `<ProductOGMeta>` component — Next.js Metadata doesn't support og:type=product natively
- **Sitemap not at /sitemap.xml**: By design. Submit the obfuscated URL to search engines manually
