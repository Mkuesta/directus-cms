import * as fs from 'node:fs';
import * as path from 'node:path';
import type { SiteOptions } from '../../../create-directus-site/src/prompts.js';
import * as gen from '../../../create-directus-site/src/generators.js';

function write(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
}

export function scaffoldSite(root: string, opts: SiteOptions): void {
  // Package.json and env
  write(path.join(root, 'package.json'), gen.generatePackageJson(opts));
  write(path.join(root, '.env.local'), gen.generateEnvLocal(opts));
  write(path.join(root, '.gitignore'), 'node_modules\n.next\n.env.local\ndist\n');

  // TSConfig
  write(path.join(root, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      target: 'ES2017',
      lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'preserve',
      incremental: true,
      plugins: [{ name: 'next' }],
      paths: { '@/*': ['./*'] },
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules'],
  }, null, 2));

  // next.config
  write(path.join(root, 'next.config.ts'), `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: new URL('${opts.directusUrl}').hostname },
    ],
  },
};

export default nextConfig;
`);

  // Lib configs
  write(path.join(root, 'lib', 'cms.ts'), gen.generateCmsConfig(opts));
  if (opts.includeProducts) write(path.join(root, 'lib', 'products.ts'), gen.generateProductsConfig(opts));
  if (opts.includeSitemap) write(path.join(root, 'lib', 'sitemap.ts'), gen.generateSitemapConfig(opts));
  if (opts.includeNavigation) write(path.join(root, 'lib', 'navigation.ts'), gen.generateNavigationConfig(opts));
  if (opts.includePages) write(path.join(root, 'lib', 'pages.ts'), gen.generatePagesConfig(opts));
  if (opts.includeForms) write(path.join(root, 'lib', 'forms.ts'), gen.generateFormsConfig(opts));
  if (opts.includeAnalytics) write(path.join(root, 'lib', 'analytics.ts'), gen.generateAnalyticsConfig(opts));
  if (opts.includeRedirects) write(path.join(root, 'lib', 'redirects.ts'), gen.generateRedirectsConfig(opts));
  if (opts.includeMedia) write(path.join(root, 'lib', 'media.ts'), gen.generateMediaConfig(opts));
  if (opts.includeBanners) write(path.join(root, 'lib', 'banners.ts'), gen.generateBannersConfig(opts));
  if (opts.includeI18n) write(path.join(root, 'lib', 'i18n.ts'), gen.generateI18nConfig(opts));
  if (opts.includeSeo) write(path.join(root, 'lib', 'seo.ts'), gen.generateSeoConfig(opts));
  if (opts.includeSearch) {
    write(path.join(root, 'lib', 'search.ts'), gen.generateSearchConfig(opts));
    write(path.join(root, 'app', 'api', 'search', 'route.ts'), gen.generateSearchApiRoute());
  }
  if (opts.includeTags) write(path.join(root, 'lib', 'tags.ts'), gen.generateTagsConfig(opts));
  if (opts.includePreview) {
    write(path.join(root, 'lib', 'preview.ts'), gen.generatePreviewConfig(opts));
    write(path.join(root, 'app', 'api', 'preview', 'route.ts'), gen.generatePreviewApiRoute());
    write(path.join(root, 'app', 'api', 'preview', 'exit', 'route.ts'), gen.generateExitPreviewRoute());
  }
  if (opts.includeWebhooks) {
    write(path.join(root, 'lib', 'webhooks.ts'), gen.generateWebhooksConfig(opts));
    write(path.join(root, 'app', 'api', 'webhooks', 'directus', 'route.ts'), gen.generateWebhooksApiRoute());
  }
  if (opts.includeStripe) {
    write(path.join(root, 'lib', 'stripe.ts'), gen.generateStripeConfig(opts));
    write(path.join(root, 'app', 'api', 'checkout', 'route.ts'), gen.generateStripeCheckoutRoute());
    write(path.join(root, 'app', 'api', 'webhooks', 'stripe', 'route.ts'), gen.generateStripeWebhookRoute());
  }
  if (opts.includeAuth) {
    write(path.join(root, 'lib', 'auth.ts'), gen.generateAuthConfig(opts));
    write(path.join(root, 'app', 'api', 'auth', 'callback', 'route.ts'), gen.generateAuthCallbackRoute());
  }
  if (opts.includeEmail) {
    write(path.join(root, 'lib', 'email.ts'), gen.generateEmailConfig(opts));
    write(path.join(root, 'app', 'api', 'email', 'route.ts'), gen.generateEmailApiRoute());
  }

  // App routes
  write(path.join(root, 'app', 'layout.tsx'), gen.generateLayout(opts));
  write(path.join(root, 'app', 'page.tsx'), gen.generateHomePage(opts));

  if (opts.includeSitemap) {
    write(path.join(root, 'app', 'sitemap.ts'), gen.generateSitemapRoute());
    write(path.join(root, 'app', 'robots.ts'), gen.generateRobotsRoute());
  }

  if (opts.includeForms) {
    write(path.join(root, 'app', 'api', 'forms', 'route.ts'), gen.generateFormsApiRoute());
  }

  if (opts.includeRedirects) {
    write(path.join(root, 'middleware.ts'), gen.generateMiddleware(opts));
  }
}
