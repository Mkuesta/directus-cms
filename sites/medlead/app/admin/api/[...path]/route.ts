import { createDirectus, rest, staticToken } from '@directus/sdk';
import { createAdminApiHandler } from '@mkuesta/admin';
import { DIRECTUS_URL, DIRECTUS_TOKEN, COLLECTIONS, CURRENT_SITE_ID } from '@/lib/directus/config';

const directus = DIRECTUS_TOKEN
  ? createDirectus(DIRECTUS_URL).with(staticToken(DIRECTUS_TOKEN)).with(rest())
  : createDirectus(DIRECTUS_URL).with(rest());

const handler = createAdminApiHandler({
  directus,
  directusUrl: DIRECTUS_URL,
  directusToken: DIRECTUS_TOKEN,
  collections: {
    posts: COLLECTIONS.posts,
    settings: COLLECTIONS.settings,
    blogCategories: COLLECTIONS.blogCategories,
    subscribers: COLLECTIONS.subscribers,
  },
  siteName: 'MedLead',
  adminSecret: process.env.ADMIN_SECRET || '',
  siteId: CURRENT_SITE_ID,
});

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, context: RouteContext) {
  return handler(request as any, context);
}

export async function POST(request: Request, context: RouteContext) {
  return handler(request as any, context);
}

export async function PUT(request: Request, context: RouteContext) {
  return handler(request as any, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return handler(request as any, context);
}
