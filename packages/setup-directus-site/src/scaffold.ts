import * as fs from 'node:fs';
import * as path from 'node:path';
import * as gen from 'create-directus-site/lib';
import type { SiteOptions } from 'create-directus-site/lib';

function write(filePath: string, content: string) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`    created ${path.relative(process.cwd(), filePath)}`);
}

export interface ScaffoldEnv {
  staticToken: string;
  adminPassword?: string;
  adminSecret?: string;
}

export function scaffold(opts: SiteOptions, rootDir: string, env: ScaffoldEnv): void {
  // Package.json and env
  write(path.join(rootDir, 'package.json'), gen.generatePackageJson(opts));

  // Generate .env.local with real values instead of placeholders
  let envContent = gen.generateEnvLocal(opts);
  envContent = envContent.replace(
    /DIRECTUS_STATIC_TOKEN=.*/,
    `DIRECTUS_STATIC_TOKEN=${env.staticToken}`,
  );
  if (env.adminPassword) {
    envContent = envContent.replace(
      /ADMIN_PASSWORD=.*/,
      `ADMIN_PASSWORD=${env.adminPassword}`,
    );
  }
  if (env.adminSecret) {
    envContent = envContent.replace(
      /ADMIN_SECRET=.*/,
      `ADMIN_SECRET=${env.adminSecret}`,
    );
  }
  write(path.join(rootDir, '.env.local'), envContent);

  write(path.join(rootDir, '.gitignore'), 'node_modules\n.next\n.env.local\ndist\n');

  // TSConfig
  write(path.join(rootDir, 'tsconfig.json'), JSON.stringify({
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
  write(path.join(rootDir, 'next.config.ts'), `import type { NextConfig } from 'next';

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
  write(path.join(rootDir, 'lib', 'cms.ts'), gen.generateCmsConfig(opts));
  if (opts.includeProducts) write(path.join(rootDir, 'lib', 'products.ts'), gen.generateProductsConfig(opts));
  if (opts.includeSitemap) write(path.join(rootDir, 'lib', 'sitemap.ts'), gen.generateSitemapConfig(opts));
  if (opts.includeNavigation) write(path.join(rootDir, 'lib', 'navigation.ts'), gen.generateNavigationConfig(opts));
  if (opts.includePages) write(path.join(rootDir, 'lib', 'pages.ts'), gen.generatePagesConfig(opts));
  if (opts.includeForms) write(path.join(rootDir, 'lib', 'forms.ts'), gen.generateFormsConfig(opts));
  if (opts.includeAnalytics) write(path.join(rootDir, 'lib', 'analytics.ts'), gen.generateAnalyticsConfig(opts));
  if (opts.includeRedirects) write(path.join(rootDir, 'lib', 'redirects.ts'), gen.generateRedirectsConfig(opts));
  if (opts.includeMedia) write(path.join(rootDir, 'lib', 'media.ts'), gen.generateMediaConfig(opts));
  if (opts.includeBanners) write(path.join(rootDir, 'lib', 'banners.ts'), gen.generateBannersConfig(opts));
  if (opts.includeI18n) write(path.join(rootDir, 'lib', 'i18n.ts'), gen.generateI18nConfig(opts));

  // App routes
  write(path.join(rootDir, 'app', 'layout.tsx'), gen.generateLayout(opts));
  write(path.join(rootDir, 'app', 'page.tsx'), gen.generateHomePage(opts));

  if (opts.includeSitemap) {
    write(path.join(rootDir, 'app', 'sitemap.ts'), gen.generateSitemapRoute());
    write(path.join(rootDir, 'app', 'robots.ts'), gen.generateRobotsRoute());
  }

  if (opts.includeForms) {
    write(path.join(rootDir, 'app', 'api', 'forms', 'route.ts'), gen.generateFormsApiRoute());
  }

  if (opts.includeRedirects) {
    write(path.join(rootDir, 'middleware.ts'), gen.generateMiddleware(opts));
  }
}
