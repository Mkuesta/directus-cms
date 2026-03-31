# @directus-cms/redirects

URL redirect management from Directus for Next.js sites. Supports exact matches and regex patterns with capture groups, cached for performance, middleware-compatible.

## Setup

### 1. Directus Collection (`{prefix}_redirects`)

| Field | Type | Description |
|-------|------|-------------|
| `source` | String | Source path (e.g. `/old-page`) or regex (e.g. `/blog/(.*)`) |
| `destination` | String | Target path (e.g. `/new-page`) or with captures (`/articles/$1`) |
| `status_code` | Dropdown | `301`, `302`, `307`, `308` |
| `is_regex` | Boolean | Whether source is a regex pattern |
| `active` | Boolean | Enable/disable without deleting |
| `sort` | Integer | Priority order (first match wins) |
| `site` | Integer | Optional multi-tenant site ID |

### 2. Config

```ts
// lib/redirects.ts
import { createRedirectClient } from '@directus-cms/redirects';
import { directus, COLLECTION_PREFIX } from './cms';

export const redirects = createRedirectClient({
  directus,
  collections: { redirects: `${COLLECTION_PREFIX}_redirects` },
  directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
});
```

### 3. Next.js Middleware

```ts
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { redirects } from '@/lib/redirects';

export async function middleware(request: NextRequest) {
  const match = await redirects.matchRedirect(request.nextUrl.pathname);
  if (match) {
    return NextResponse.redirect(new URL(match.destination, request.url), match.statusCode);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
```

## Features

- **Exact match**: `/old-page` → `/new-page`
- **Regex with captures**: `/blog/(.*)` → `/articles/$1`
- **60-second cache** (configurable via `cacheTtl`)
- **`clearCache()`** to bust cache after editing in Directus
- **Multi-tenancy** via `siteId`

## API

| Method | Returns | Description |
|--------|---------|-------------|
| `getRedirects()` | `Promise<Redirect[]>` | All active redirects |
| `matchRedirect(pathname)` | `Promise<RedirectMatch \| null>` | First matching redirect |
| `clearCache()` | `void` | Clear redirect cache |
