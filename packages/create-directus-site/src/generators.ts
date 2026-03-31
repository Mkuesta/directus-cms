import type { SiteOptions } from './prompts';

export function generatePackageJson(opts: SiteOptions): string {
  const deps: Record<string, string> = {
    'next': '^15.0.0',
    'react': '^18.2.0',
    'react-dom': '^18.2.0',
    '@directus/sdk': '^17.0.1',
    '@directus-cms/core': 'file:../../directus-cms-core',
  };

  if (opts.includeProducts) deps['@directus-cms/products'] = 'file:../../directus-cms-products';
  if (opts.includeAdmin) deps['@directus-cms/admin'] = 'file:../../directus-cms-admin';
  if (opts.includeSitemap) deps['@directus-cms/sitemap'] = 'file:../../directus-cms-sitemap';
  if (opts.includeNavigation) deps['@directus-cms/navigation'] = 'file:../../directus-cms-navigation';
  if (opts.includePages) deps['@directus-cms/pages'] = 'file:../../directus-cms-pages';
  if (opts.includeForms) deps['@directus-cms/forms'] = 'file:../../directus-cms-forms';
  if (opts.includeAnalytics) deps['@directus-cms/analytics'] = 'file:../../directus-cms-analytics';
  if (opts.includeRedirects) deps['@directus-cms/redirects'] = 'file:../../directus-cms-redirects';
  if (opts.includeMedia) deps['@directus-cms/media'] = 'file:../../directus-cms-media';
  if (opts.includeBanners) deps['@directus-cms/banners'] = 'file:../../directus-cms-banners';
  if (opts.includeI18n) deps['@directus-cms/i18n'] = 'file:../../directus-cms-i18n';
  if (opts.includeSeo) deps['@directus-cms/seo'] = 'file:../../directus-cms-seo';
  if (opts.includeSearch) deps['@directus-cms/search'] = 'file:../../directus-cms-search';
  if (opts.includeTags) deps['@directus-cms/tags'] = 'file:../../directus-cms-tags';
  if (opts.includePreview) deps['@directus-cms/preview'] = 'file:../../directus-cms-preview';
  if (opts.includeWebhooks) deps['@directus-cms/webhooks'] = 'file:../../directus-cms-webhooks';
  if (opts.includeStripe) deps['@directus-cms/stripe'] = 'file:../../directus-cms-stripe';
  if (opts.includeAuth) deps['@directus-cms/auth'] = 'file:../../directus-cms-auth';
  if (opts.includeEmail) deps['@directus-cms/email'] = 'file:../../directus-cms-email';
  if (opts.includeNewsletter) deps['@directus-cms/newsletter'] = 'file:../../directus-cms-newsletter';
  if (opts.includeNotifications) deps['@directus-cms/notifications'] = 'file:../../directus-cms-notifications';

  return JSON.stringify({
    name: opts.siteSlug,
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
    },
    dependencies: deps,
    devDependencies: {
      '@types/react': '^18.2.0',
      'typescript': '^5.5.0',
    },
  }, null, 2);
}

export function generateEnvLocal(opts: SiteOptions): string {
  const lines = [
    `NEXT_PUBLIC_DIRECTUS_URL=${opts.directusUrl}`,
    'DIRECTUS_STATIC_TOKEN=your-directus-token-here',
    '',
  ];
  if (opts.includeAdmin) {
    lines.push('# Admin panel');
    lines.push('ADMIN_PASSWORD=change-me');
    lines.push('ADMIN_SECRET=generate-with-openssl-rand-hex-32');
    lines.push('');
  }
  if (opts.includePreview) {
    lines.push('# Preview mode');
    lines.push('PREVIEW_SECRET=generate-with-openssl-rand-hex-32');
    lines.push('DIRECTUS_ADMIN_TOKEN=your-admin-token-here');
    lines.push('');
  }
  if (opts.includeWebhooks) {
    lines.push('# Webhooks');
    lines.push('WEBHOOK_SECRET=generate-with-openssl-rand-hex-32');
    lines.push('');
  }
  if (opts.includeStripe) {
    lines.push('# Stripe');
    lines.push('STRIPE_SECRET_KEY=sk_test_...');
    lines.push('STRIPE_WEBHOOK_SECRET=whsec_...');
    lines.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...');
    lines.push('');
  }
  if (opts.includeAuth) {
    lines.push('# Supabase Auth');
    lines.push('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
    lines.push('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
    lines.push('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
    lines.push('');
  }
  if (opts.includeEmail) {
    lines.push('# Email (Resend)');
    lines.push('RESEND_API_KEY=re_...');
    lines.push('EMAIL_FROM=noreply@yourdomain.com');
    lines.push('');
  }
  return lines.join('\n');
}

export function generateCmsConfig(opts: SiteOptions): string {
  return `import { createDirectus, rest, staticToken } from '@directus/sdk';
import { createCmsClient } from '@directus-cms/core';

const COLLECTION_PREFIX = '${opts.collectionPrefix.replace(/'/g, "\\'")}';


const directus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
  .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN!))
  .with(rest());

export const cms = createCmsClient({
  directus,
  collections: {
    posts: \`\${COLLECTION_PREFIX}_posts\`,
    settings: \`\${COLLECTION_PREFIX}_settings\`,
    blogCategories: \`\${COLLECTION_PREFIX}_blog_categories\`,
    categories: \`\${COLLECTION_PREFIX}_categories\`,
    products: \`\${COLLECTION_PREFIX}_products\`,
  },
  siteName: '${opts.siteName.replace(/'/g, "\\'")}',
  baseUrl: '${opts.baseUrl.replace(/'/g, "\\'")}',
  directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
  route: '${opts.blogRoute.replace(/'/g, "\\'")}',
});

export { directus, COLLECTION_PREFIX };
`;
}

export function generateProductsConfig(opts: SiteOptions): string {
  return `import { createProductClient } from '@directus-cms/products';
import { directus, COLLECTION_PREFIX } from './cms';

export const products = createProductClient({
  directus,
  collections: {
    products: \`\${COLLECTION_PREFIX}_products\`,
    categories: \`\${COLLECTION_PREFIX}_categories\`,
    settings: \`\${COLLECTION_PREFIX}_settings\`,
  },
  siteName: '${opts.siteName}',
  baseUrl: '${opts.baseUrl}',
  directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
  siteId: ${opts.siteId},
  currency: '${opts.currency}',
  productRoute: '${opts.productRoute}',
  categoryRoute: '${opts.categoryRoute}',
  listingRoute: '${opts.listingRoute}',
});
`;
}

export function generateSitemapConfig(opts: SiteOptions): string {
  const imports = ["import { createSitemapClient } from '@directus-cms/sitemap';", "import { cms } from './cms';"];
  const configLines = [`  baseUrl: '${opts.baseUrl}',`, '  cms,'];

  if (opts.includeProducts) {
    imports.push("import { products } from './products';");
    configLines.push('  products,');
  }

  configLines.push("  staticPages: [");
  configLines.push("    { path: '/', priority: 1.0 },");
  configLines.push("    { path: '/about', priority: 0.5 },");
  configLines.push("    { path: '/contact', priority: 0.5 },");
  configLines.push("  ],");

  return `${imports.join('\n')}

export const sitemapClient = createSitemapClient({
${configLines.join('\n')}
});
`;
}

export function generateNavigationConfig(opts: SiteOptions): string {
  return `import { createNavigationClient } from '@directus-cms/navigation';
import { directus, COLLECTION_PREFIX } from './cms';

export const nav = createNavigationClient({
  directus,
  collections: {
    items: \`\${COLLECTION_PREFIX}_navigation_items\`,
  },
  directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
});
`;
}

export function generatePagesConfig(opts: SiteOptions): string {
  return `import { createPageClient } from '@directus-cms/pages';
import { directus, COLLECTION_PREFIX } from './cms';

export const pages = createPageClient({
  directus,
  collections: {
    pages: \`\${COLLECTION_PREFIX}_pages\`,
  },
  siteName: '${opts.siteName}',
  baseUrl: '${opts.baseUrl}',
  directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
});
`;
}

export function generateFormsConfig(opts: SiteOptions): string {
  return `import { createFormClient } from '@directus-cms/forms';
import { directus, COLLECTION_PREFIX } from './cms';

export const forms = createFormClient({
  directus,
  collections: {
    submissions: \`\${COLLECTION_PREFIX}_form_submissions\`,
  },
  siteName: '${opts.siteName}',
});
`;
}

export function generateAnalyticsConfig(opts: SiteOptions): string {
  return `import { createAnalyticsClient } from '@directus-cms/analytics';
import { directus, COLLECTION_PREFIX } from './cms';

export const analytics = createAnalyticsClient({
  directus,
  collections: {
    settings: \`\${COLLECTION_PREFIX}_analytics_settings\`,
  },
  directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
});
`;
}

export function generateRedirectsConfig(opts: SiteOptions): string {
  return `import { createRedirectClient } from '@directus-cms/redirects';
import { directus, COLLECTION_PREFIX } from './cms';

export const redirects = createRedirectClient({
  directus,
  collections: {
    redirects: \`\${COLLECTION_PREFIX}_redirects\`,
  },
  directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
});
`;
}

export function generateMediaConfig(opts: SiteOptions): string {
  return `import { createMediaClient } from '@directus-cms/media';
import { directus, COLLECTION_PREFIX } from './cms';

export const media = createMediaClient({
  directus,
  collections: {
    galleries: \`\${COLLECTION_PREFIX}_galleries\`,
    galleryItems: \`\${COLLECTION_PREFIX}_gallery_items\`,
  },
  directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
});
`;
}

export function generateBannersConfig(opts: SiteOptions): string {
  return `import { createBannerClient } from '@directus-cms/banners';
import { directus, COLLECTION_PREFIX } from './cms';

export const banners = createBannerClient({
  directus,
  collections: {
    banners: \`\${COLLECTION_PREFIX}_banners\`,
  },
  directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
});
`;
}

export function generateI18nConfig(opts: SiteOptions): string {
  return `import { createI18nClient } from '@directus-cms/i18n';
import { directus, COLLECTION_PREFIX } from './cms';

export const i18n = createI18nClient({
  directus,
  collections: {
    translations: \`\${COLLECTION_PREFIX}_translations\`,
  },
  directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
  defaultLocale: '${opts.defaultLocale}',
  locales: ${JSON.stringify(opts.locales)},
});
`;
}

export function generateMiddleware(opts: SiteOptions): string {
  if (!opts.includeRedirects) return '';
  return `import { NextResponse } from 'next/server';
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
`;
}

export function generateSitemapRoute(): string {
  return `import { sitemapClient } from '@/lib/sitemap';

export default async function sitemap() {
  return sitemapClient.generateSitemap();
}
`;
}

export function generateRobotsRoute(): string {
  return `import { sitemapClient } from '@/lib/sitemap';

export default async function robots() {
  return sitemapClient.generateRobots();
}
`;
}

export function generateFormsApiRoute(): string {
  return `import { forms } from '@/lib/forms';

const handler = forms.createApiHandler();

export const POST = handler;
`;
}

export function generateSeoConfig(opts: SiteOptions): string {
  return `import { createSeoClient } from '@directus-cms/seo';

export const seo = createSeoClient({
  baseUrl: '${opts.baseUrl}',
  siteName: '${opts.siteName}',
  twitterHandle: undefined,
});
`;
}

export function generateSearchConfig(opts: SiteOptions): string {
  return `import { createSearchClient } from '@directus-cms/search';
import { directus, COLLECTION_PREFIX } from './cms';

export const search = createSearchClient({
  directus,
  directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
  collections: [
    {
      collection: \`\${COLLECTION_PREFIX}_posts\`,
      type: 'post',
      searchFields: ['title', 'content', 'excerpt'],
      resultFields: ['id', 'title', 'slug', 'excerpt', 'featured_image'],
      titleField: 'title',
      slugField: 'slug',
      excerptField: 'excerpt',
      imageField: 'featured_image',
      baseFilter: { status: { _eq: 'published' } },
      urlPrefix: '/${opts.blogRoute}',
    },
  ],
});
`;
}

export function generateSearchApiRoute(): string {
  return `import { search } from '@/lib/search';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';
  const type = url.searchParams.get('type') || undefined;
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);

  const results = await search.search(query, { limit, types: type ? [type] : undefined });
  return Response.json(results);
}
`;
}

export function generateTagsConfig(opts: SiteOptions): string {
  return `import { createTagClient } from '@directus-cms/tags';
import { directus, COLLECTION_PREFIX } from './cms';

export const tags = createTagClient({
  directus,
  directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
  collections: {
    posts: \`\${COLLECTION_PREFIX}_posts\`,
  },
});
`;
}

export function generatePreviewConfig(opts: SiteOptions): string {
  return `import { createDirectus, rest, staticToken } from '@directus/sdk';
import { createPreviewClient } from '@directus-cms/preview';

const COLLECTION_PREFIX = '${opts.collectionPrefix.replace(/'/g, "\\'")}';


const adminDirectus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
  .with(staticToken(process.env.DIRECTUS_ADMIN_TOKEN!))
  .with(rest());

export const preview = createPreviewClient({
  directus: adminDirectus,
  directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL!,
  collections: {
    posts: \`\${COLLECTION_PREFIX}_posts\`,
    pages: \`\${COLLECTION_PREFIX}_pages\`,
  },
  previewSecret: process.env.PREVIEW_SECRET!,
});
`;
}

export function generatePreviewApiRoute(): string {
  return `import { createPreviewApiHandler } from '@directus-cms/preview';
import { preview } from '@/lib/preview';

const handler = createPreviewApiHandler(preview.config);

export const GET = handler;
`;
}

export function generateExitPreviewRoute(): string {
  return `import { createExitPreviewHandler } from '@directus-cms/preview';
import { preview } from '@/lib/preview';

const handler = createExitPreviewHandler(preview.config);

export const GET = handler;
`;
}

export function generateWebhooksConfig(opts: SiteOptions): string {
  return `import { defaultCollectionMappings } from '@directus-cms/webhooks';

const COLLECTION_PREFIX = '${opts.collectionPrefix.replace(/'/g, "\\'")}';


export const webhookConfig = {
  secret: process.env.WEBHOOK_SECRET!,
  mappings: defaultCollectionMappings(COLLECTION_PREFIX),
};
`;
}

export function generateWebhooksApiRoute(): string {
  return `import { createWebhookHandler } from '@directus-cms/webhooks';
import { webhookConfig } from '@/lib/webhooks';

const handler = createWebhookHandler(webhookConfig);

export const POST = handler;
`;
}

export function generateStripeConfig(opts: SiteOptions): string {
  return `import { createStripeClient } from '@directus-cms/stripe';
import { directus, COLLECTION_PREFIX } from './cms';

export const stripe = createStripeClient({
  directus,
  collections: {
    orders: \`\${COLLECTION_PREFIX}_orders\`,
    products: \`\${COLLECTION_PREFIX}_products\`,
  },
  stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  successUrl: '${opts.baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}',
  cancelUrl: '${opts.baseUrl}/checkout/cancel',
  currency: '${opts.currency}',
  siteId: ${opts.siteId},
});
`;
}

export function generateStripeCheckoutRoute(): string {
  return `import { stripe } from '@/lib/stripe';

const handler = stripe.createCheckoutApiHandler();

export const POST = handler;
`;
}

export function generateStripeWebhookRoute(): string {
  return `import { stripe } from '@/lib/stripe';

const handler = stripe.createStripeWebhookHandler();

export const POST = handler;
`;
}

export function generateAuthConfig(opts: SiteOptions): string {
  return `import { createAuthClient } from '@directus-cms/auth';
import { directus, COLLECTION_PREFIX } from './cms';

export const auth = createAuthClient({
  directus,
  collections: {
    userProfiles: \`\${COLLECTION_PREFIX}_user_profiles\`,
  },
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  siteId: ${opts.siteId},
});
`;
}

export function generateAuthCallbackRoute(): string {
  return `import { auth } from '@/lib/auth';

const handler = auth.createAuthCallbackHandler();

export const GET = handler;
`;
}

export function generateEmailConfig(opts: SiteOptions): string {
  return `import { createEmailClient } from '@directus-cms/email';
import { directus, COLLECTION_PREFIX } from './cms';

export const email = createEmailClient({
  directus,
  collections: {
    templates: \`\${COLLECTION_PREFIX}_email_templates\`,
    log: \`\${COLLECTION_PREFIX}_email_log\`,
  },
  resendApiKey: process.env.RESEND_API_KEY!,
  fromEmail: process.env.EMAIL_FROM!,
  siteName: '${opts.siteName}',
  enableLogging: true,
});
`;
}

export function generateEmailApiRoute(): string {
  return `import { email } from '@/lib/email';

const handler = email.createApiHandler();

export const POST = handler;
`;
}

export function generateNewsletterConfig(opts: SiteOptions): string {
  const imports = [
    "import { createNewsletterClient } from '@directus-cms/newsletter';",
    "import { directus, COLLECTION_PREFIX } from './cms';",
  ];
  const configLines: string[] = [
    '  directus,',
    '  collections: {',
    '    subscribers: `${COLLECTION_PREFIX}_subscribers`,',
    '  },',
    `  siteName: '${opts.siteName}',`,
    '  doubleOptIn: true,',
    `  confirmationUrl: '${opts.baseUrl}/api/newsletter',`,
  ];

  if (opts.includeEmail) {
    imports.push("import { email } from './email';");
    configLines.push('  emailClient: email,');
  }

  return `${imports.join('\n')}

export const newsletter = createNewsletterClient({
${configLines.join('\n')}
});
`;
}

export function generateNewsletterApiRoute(): string {
  return `import { newsletter } from '@/lib/newsletter';

const handler = newsletter.createApiHandler();

export const POST = handler;
export const GET = handler;
`;
}

export function generateNotificationsConfig(opts: SiteOptions): string {
  return `// Notifications: use <NotificationProvider> in layout and useNotification() hook in components.
// The client below is optional — only needed if you want CMS-managed notification templates.
import { createNotificationClient } from '@directus-cms/notifications';
import { directus, COLLECTION_PREFIX } from './cms';

export const notifications = createNotificationClient({
  directus,
  collections: {
    templates: \`\${COLLECTION_PREFIX}_notification_templates\`,
  },
  defaultDuration: 5000,
  position: 'top-right',
});
`;
}

export function generateLayout(opts: SiteOptions): string {
  if (opts.includeNotifications) {
    return `import type { Metadata } from 'next';
import { NotificationProvider } from '@directus-cms/notifications/components';

export const metadata: Metadata = {
  title: '${opts.siteName}',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="${opts.defaultLocale}">
      <body>
        <NotificationProvider position="top-right">
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
`;
  }

  return `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${opts.siteName}',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="${opts.defaultLocale}">
      <body>{children}</body>
    </html>
  );
}
`;
}

export function generateHomePage(opts: SiteOptions): string {
  return `export default function Home() {
  return (
    <main>
      <h1>${opts.siteName}</h1>
      <p>Site generated with create-directus-site</p>
    </main>
  );
}
`;
}
