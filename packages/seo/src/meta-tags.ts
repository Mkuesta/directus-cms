import type { SeoConfig, MetaTagInput, MetaTagResult } from './types.js';

export function generateMetaTags(
  config: SeoConfig,
  input: MetaTagInput,
): MetaTagResult {
  const result: MetaTagResult = {
    title: input.title,
  };

  if (input.description) result.description = input.description;
  if (input.keywords) result.keywords = input.keywords;
  if (input.noIndex) result.robots = 'noindex, nofollow';

  // Canonical + alternates
  const alternates: MetaTagResult['alternates'] = {};
  if (input.canonicalPath) {
    alternates.canonical = generateCanonicalUrl(config, input.canonicalPath);
  }
  if (input.alternateLanguages?.length) {
    alternates.languages = {};
    for (const alt of input.alternateLanguages) {
      alternates.languages[alt.locale] = alt.url;
    }
  }
  if (alternates.canonical || alternates.languages) {
    result.alternates = alternates;
  }

  // Open Graph
  result.openGraph = {
    title: input.title,
    siteName: config.siteName,
  };
  if (input.description) result.openGraph.description = input.description;
  if (input.canonicalPath) {
    result.openGraph.url = generateCanonicalUrl(config, input.canonicalPath);
  }
  if (input.ogImage || config.defaultOgImage) {
    result.openGraph.images = [{ url: input.ogImage || config.defaultOgImage! }];
  }
  result.openGraph.type = input.ogType || 'website';

  // Twitter
  result.twitter = {
    card: 'summary_large_image',
    title: input.title,
  };
  if (input.description) result.twitter.description = input.description;
  if (input.ogImage || config.defaultOgImage) {
    result.twitter.images = [input.ogImage || config.defaultOgImage!];
  }
  if (config.twitterHandle) {
    result.twitter.creator = `@${config.twitterHandle.replace(/^@/, '')}`;
  }

  return result;
}

export function generateCanonicalUrl(
  config: SeoConfig,
  path: string,
  params?: Record<string, string>,
): string {
  let url = `${config.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

  if (config.trailingSlash && !url.endsWith('/')) {
    url += '/';
  } else if (config.trailingSlash === false && url.endsWith('/') && url !== `${config.baseUrl}/`) {
    url = url.slice(0, -1);
  }

  if (params) {
    const searchParams = new URLSearchParams(params);
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  return url;
}
