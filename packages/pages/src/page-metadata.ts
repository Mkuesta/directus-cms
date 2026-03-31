import type { PageConfig, PageMetadata } from './types';
import { getPage } from './pages';

export async function getPageMetadata(config: PageConfig, slug: string): Promise<PageMetadata> {
  const page = await getPage(config, slug);
  if (!page) {
    return { title: 'Not Found' };
  }

  const title = page.seo?.title ?? page.title;
  const description = page.seo?.description ?? page.excerpt;
  const keywords = page.seo?.keywords
    ? page.seo.keywords.split(',').map((k) => k.trim()).filter(Boolean)
    : undefined;

  const images: { url: string }[] = [];
  if (page.ogImageUrl) images.push({ url: page.ogImageUrl });
  else if (page.featuredImageUrl) images.push({ url: page.featuredImageUrl });

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `${config.baseUrl}/${page.slug}`,
      siteName: config.siteName,
      images: images.length > 0 ? images : undefined,
      type: 'website',
    },
    robots: page.metaRobots,
    alternates: {
      canonical: `${config.baseUrl}/${page.slug}`,
    },
  };
}
