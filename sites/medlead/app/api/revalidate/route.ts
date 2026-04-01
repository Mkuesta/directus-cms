import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createWebhookHandler, defaultCollectionMappings } from '@mkuesta/webhooks';

const webhookSecret = process.env.WEBHOOK_SECRET || '';
const legacySecret = process.env.REVALIDATION_SECRET || '';

// Use the package's webhook handler for HMAC-signed requests
const webhookHandler = createWebhookHandler({
  secret: webhookSecret,
  mappings: [
    ...defaultCollectionMappings('medlead'),
    // Custom: medlead_pages revalidates dynamic page routes
    {
      collection: 'medlead_pages',
      actions: [
        { type: 'revalidatePath', path: '/', mode: 'layout' },
        { type: 'revalidateTag', tag: 'pages' },
        { type: 'revalidatePath', path: '/sitemap.xml' },
      ],
    },
    // Custom: medlead_categories revalidates /data pages
    {
      collection: 'medlead_categories',
      actions: [
        { type: 'revalidatePath', path: '/data', mode: 'layout' },
        { type: 'revalidateTag', tag: 'categories' },
        { type: 'revalidatePath', path: '/sitemap.xml' },
      ],
    },
  ],
});

export async function POST(request: NextRequest) {
  // Check for HMAC signature (new approach via package)
  const signature = request.headers.get('x-directus-signature');
  if (signature && webhookSecret) {
    return webhookHandler(request);
  }

  // Legacy: simple secret-based validation (backwards compatible)
  const providedSecret =
    request.headers.get('x-revalidation-secret') ||
    request.nextUrl.searchParams.get('secret');

  if (!legacySecret || providedSecret !== legacySecret) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { collection, slug, category } = body as {
      collection?: string;
      slug?: string;
      category?: string;
    };

    const revalidated: string[] = [];

    if (collection === 'medlead_posts') {
      if (slug && category) {
        revalidatePath(`/blog/${category}/${slug}`);
        revalidated.push(`/blog/${category}/${slug}`);
      }
      revalidatePath('/blog');
      revalidated.push('/blog');
    }

    if (collection === 'medlead_blog_categories') {
      revalidatePath('/blog');
      revalidated.push('/blog');
      if (category) {
        revalidatePath(`/blog/${category}`);
        revalidated.push(`/blog/${category}`);
      }
    }

    if (collection === 'medlead_pages') {
      if (slug) {
        revalidatePath(`/${slug}`);
        revalidated.push(`/${slug}`);
      }
    }

    if (collection === 'medlead_settings') {
      revalidatePath('/blog', 'layout');
      revalidated.push('/blog (layout)');
    }

    revalidatePath('/sitemap.xml');
    revalidated.push('/sitemap.xml');

    return NextResponse.json({
      revalidated: true,
      paths: revalidated,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
