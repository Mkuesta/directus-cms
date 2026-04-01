import type { Metadata } from 'next';
import type { ProductConfig, Product } from './types';
import { getProductBySlug } from './products';
import { getProductCategoryBySlug } from './categories';
import { getSettings as getCoreSettings, type SiteSettings } from '@mkuesta/core';

/**
 * Fetches settings singleton using the core getSettings, adapted for ProductConfig.
 */
function getProductSettings(config: ProductConfig): Promise<SiteSettings> {
  return getCoreSettings({
    directus: config.directus,
    collections: { settings: config.collections.settings, posts: '', blogCategories: '', categories: '', products: '' },
    siteName: config.siteName,
    baseUrl: config.baseUrl,
    directusUrl: config.directusUrl,
    route: '',
  });
}

/**
 * Build a clean, complete product description for meta tags.
 * Prefers seoDescription if it's a complete sentence, otherwise generates from title.
 */
function buildDescription(product: Product): string {
  const desc = product.seoDescription;
  // Use seoDescription if it exists, is long enough, and ends with punctuation
  if (desc && desc.length > 80 && /[.!?]$/.test(desc.trim())) {
    return desc.trim();
  }
  // Use shortDescription if it's a complete sentence
  const short = product.shortDescription;
  if (short && short.length > 80 && /[.!?]$/.test(short.trim())) {
    return short.trim();
  }
  // Generate from product title
  const name = product.title
    .replace(/:\s*\d[\d,]*\+?\s*Verified.*$/i, '')
    .replace(/\s+Email\s+List$/i, '')
    .replace(/\s+Mailing\s+List$/i, '')
    .trim();
  return `Verified ${name.toLowerCase()} contact data for healthcare marketing, recruitment, and B2B outreach. NPI-verified, CAN-SPAM compliant.`;
}

/**
 * Generates Next.js Metadata for a product detail page.
 */
export async function getProductMetadata(config: ProductConfig, slug: string): Promise<Metadata> {
  const [product, settings] = await Promise.all([
    getProductBySlug(config, slug),
    getProductSettings(config),
  ]);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  const imageUrl = product.imageUrl || settings.ogImageUrl;
  const title = product.seoTitle || product.title;
  const description = buildDescription(product);
  const url = `${config.baseUrl.trim()}/${config.productRoute}/${slug}`;

  return {
    title,
    description,
    ...(config.defaultAuthor ? { authors: [{ name: config.defaultAuthor }] } : {}),
    robots: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large' as const,
      'max-video-preview': -1,
    },
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: settings.siteName || config.siteName,
      ...(imageUrl && {
        images: [{ url: imageUrl, alt: `${product.title} by ${config.siteName}`, width: 1200, height: 630 }],
      }),
      ...(config.locale && { locale: config.locale }),
    },
    // NOTE: og:type=product requires <meta property=> not <meta name=>.
    // Next.js Metadata 'other' field renders name=, which is wrong for OG.
    // Use <ProductOGMeta> component in page head for correct og:type=product.
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(settings.twitterHandle ? { site: settings.twitterHandle } : {}),
      ...(settings.defaultAuthorTwitter || settings.twitterHandle
        ? { creator: settings.defaultAuthorTwitter || settings.twitterHandle }
        : {}),
      ...(imageUrl && {
        images: [{ url: imageUrl, alt: `${product.title} by ${config.siteName}`, width: 1200, height: 630 }],
      }),
    },
  };
}

/**
 * Generates Next.js Metadata for a product category listing page.
 */
export async function getCategoryMetadata(config: ProductConfig, categorySlug: string): Promise<Metadata> {
  const [category, settings] = await Promise.all([
    getProductCategoryBySlug(config, categorySlug),
    getProductSettings(config),
  ]);

  const name = category?.name || categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
  const title = `${name} | ${settings.siteName || config.siteName}`;
  const description = category?.description || `Browse all ${name} products at ${config.siteName}.`;
  const url = `${config.baseUrl.trim()}/${config.categoryRoute}/${categorySlug}`;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      siteName: settings.siteName || config.siteName,
      ...(settings.ogImageUrl ? { images: [{ url: settings.ogImageUrl, width: 1200, height: 630 }] } : {}),
      ...(config.locale && { locale: config.locale }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(settings.twitterHandle ? { site: settings.twitterHandle } : {}),
      ...(settings.ogImageUrl ? { images: [{ url: settings.ogImageUrl, alt: title, width: 1200, height: 630 }] } : {}),
    },
  };
}

/**
 * Generates Next.js Metadata for the product listing index page.
 */
export async function getProductIndexMetadata(config: ProductConfig): Promise<Metadata> {
  const settings = await getProductSettings(config);

  const title = `All Products | ${settings.siteName || config.siteName}`;
  const description = settings.siteDescription || `Browse all products at ${config.siteName}.`;
  const url = `${config.baseUrl.trim()}/${config.listingRoute}`;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      siteName: settings.siteName || config.siteName,
      ...(settings.ogImageUrl ? { images: [{ url: settings.ogImageUrl, width: 1200, height: 630 }] } : {}),
      ...(config.locale && { locale: config.locale }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(settings.twitterHandle ? { site: settings.twitterHandle } : {}),
      ...(settings.ogImageUrl ? { images: [{ url: settings.ogImageUrl, alt: title, width: 1200, height: 630 }] } : {}),
    },
  };
}
