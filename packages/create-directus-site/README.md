# create-directus-site

CLI scaffold tool that generates a fully wired Next.js site using the `@directus-cms/*` packages. Prompts for site name, features, and configuration, then creates a ready-to-run project.

## Usage

```bash
cd /path/to/Directus-cms-package
node create-directus-site/dist/index.js
```

Or after linking:

```bash
npm link ./create-directus-site
create-directus-site
```

## What It Does

The CLI prompts you for:

1. **Site basics**: name, slug, collection prefix, base URL, Directus URL, blog route
2. **Features**: which packages to include (products, admin, sitemap, navigation, pages, forms, analytics, redirects, media, banners, i18n)
3. **Feature config**: product routes, currency, locales, etc.

Then generates:

```
my-site/
  package.json          # with all selected @directus-cms/* deps
  .env.local            # with Directus URL + token placeholder
  .gitignore
  tsconfig.json
  next.config.ts        # with Directus image domain
  lib/
    cms.ts              # always — core CMS config
    products.ts         # if products selected
    sitemap.ts          # if sitemap selected
    navigation.ts       # if navigation selected
    pages.ts            # if pages selected
    forms.ts            # if forms selected
    analytics.ts        # if analytics selected
    redirects.ts        # if redirects selected
    media.ts            # if media selected
    banners.ts          # if banners selected
    i18n.ts             # if i18n selected
  app/
    layout.tsx
    page.tsx
    sitemap.ts          # if sitemap selected
    robots.ts           # if sitemap selected
    api/
      forms/
        route.ts        # if forms selected
  middleware.ts          # if redirects selected
```

All `lib/` configs are pre-filled with the collection prefix and settings you provided. Just add your Directus token to `.env.local` and run `npm run dev`.

## After Scaffolding

```bash
cd my-site
npm install --legacy-peer-deps
# Edit .env.local with your Directus token
npm run dev
```
