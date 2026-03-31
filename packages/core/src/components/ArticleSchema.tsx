import type { Post, SiteSettings, CmsUrlBuilders } from '../types';
import { toAbsoluteAssetUrl } from '../images';
import { fixProperNouns, getWordCount, parseKeywords } from '../seo-utils';
import { resolvePostPathFromBuilders, resolveCategoryPathFromBuilders, resolveIndexPathFromBuilders } from '../url-builder';

interface ArticleSchemaProps {
  post: Post;
  settings: SiteSettings;
  categoryName: string;
  categorySlug: string;
  baseUrl: string;
  route: string;
  /** Optional URL builders for custom URL patterns */
  urls?: CmsUrlBuilders;
  /** Breadcrumb label for the blog/resources section (defaults to capitalized route) */
  breadcrumbLabel?: string;
  /** Include Dataset schema for tables (default: false) */
  includeDataset?: boolean;
  /** Include Table schema (default: false) */
  includeTable?: boolean;
  /** Include SpeakableSpecification on article (default: false) */
  includeSpeakable?: boolean;
}

export function ArticleSchema({
  post, settings, categoryName, categorySlug, baseUrl: rawBaseUrl, route, urls,
  breadcrumbLabel,
  includeDataset = false,
  includeTable = false,
  includeSpeakable = false,
}: ArticleSchemaProps) {
  const baseUrl = rawBaseUrl.trim();

  // Build a minimal config-like object for toAbsoluteAssetUrl
  const assetConfig = { baseUrl, directusUrl: '', collections: {} as any, directus: {} as any, siteName: settings.siteName, route };

  const canonicalUrl = post.canonicalUrl
    ? (post.canonicalUrl.startsWith('http') ? post.canonicalUrl : `${baseUrl}${post.canonicalUrl}`)
    : `${baseUrl}${resolvePostPathFromBuilders(urls, route, post.slug, categorySlug)}`;

  const schemaDescription = fixProperNouns(post.seo?.description || post.excerpt || '');
  const keywords = parseKeywords(post.seo?.keywords) || post.tags || [];
  const wordCount = getWordCount(post.content);

  const sameAs: string[] = [];
  if (settings.twitterHandle) sameAs.push(`https://twitter.com/${settings.twitterHandle.replace(/^@/, '')}`);
  if (settings.linkedinUrl) sameAs.push(settings.linkedinUrl);

  const imageUrl = toAbsoluteAssetUrl(assetConfig, post.ogImage || post.featuredImage?.url)
    || settings.ogImageUrl;

  // Determine author schema
  const effectiveAuthor = post.author || settings.defaultAuthorName;
  const effectiveAuthorImage = post.authorImage?.url
    ? toAbsoluteAssetUrl(assetConfig, post.authorImage.url)
    : settings.defaultAuthorImageUrl;
  const authorType = post.authorType || (effectiveAuthor ? 'Person' : undefined);
  const authorSchema = authorType === 'Person'
    ? {
        '@type': 'Person' as const,
        name: effectiveAuthor,
        ...(post.authorTitle || settings.defaultAuthorTitle ? { jobTitle: post.authorTitle || settings.defaultAuthorTitle } : {}),
        ...(post.authorUrl || settings.defaultAuthorUrl
          ? { url: post.authorUrl || settings.defaultAuthorUrl }
          : {}),
        ...(effectiveAuthorImage ? { image: effectiveAuthorImage } : {}),
        worksFor: { '@id': `${baseUrl}/#organization` },
      }
    : { '@type': 'Organization' as const, '@id': `${baseUrl}/#organization`, name: settings.siteName };

  // Breadcrumb section label — use prop, or capitalize the route name
  const sectionLabel = breadcrumbLabel || route.charAt(0).toUpperCase() + route.slice(1);

  const graph: Record<string, unknown>[] = [
    // Organization
    {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: settings.siteName,
      url: `${baseUrl}/`,
      ...(settings.logoUrl
        ? {
            logo: {
              '@type': 'ImageObject',
              '@id': `${baseUrl}/#logo`,
              url: settings.logoUrl,
              contentUrl: settings.logoUrl,
              width: 512,
              height: 512,
            },
          }
        : {}),
      ...(settings.organizationDescription
        ? { description: settings.organizationDescription }
        : {}),
      ...(sameAs.length > 0 ? { sameAs } : {}),
    },
    // WebSite
    {
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      name: settings.siteName,
      url: `${baseUrl}/`,
      publisher: { '@id': `${baseUrl}/#organization` },
    },
    // WebPage
    {
      '@type': 'WebPage',
      '@id': `${canonicalUrl}/#webpage`,
      url: canonicalUrl,
      name: post.seo?.title || post.title,
      description: schemaDescription,
      isPartOf: { '@id': `${baseUrl}/#website` },
      breadcrumb: { '@id': `${canonicalUrl}/#breadcrumb` },
      inLanguage: 'en-US',
      ...(imageUrl
        ? { primaryImageOfPage: { '@type': 'ImageObject', url: imageUrl } }
        : {}),
      ...(post.publishedDate ? { datePublished: post.publishedDate } : {}),
      ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
    },
    // BreadcrumbList
    (() => {
      const blogIndexUrl = `${baseUrl}${resolveIndexPathFromBuilders(urls, route)}`;
      const categoryPath = resolveCategoryPathFromBuilders(urls, route, categorySlug);
      const items: Record<string, unknown>[] = [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
        { '@type': 'ListItem', position: 2, name: sectionLabel, item: blogIndexUrl },
      ];
      if (categoryPath !== null) {
        items.push({ '@type': 'ListItem', position: 3, name: categoryName, item: `${baseUrl}${categoryPath}` });
        items.push({ '@type': 'ListItem', position: 4, name: post.title, item: canonicalUrl });
      } else {
        items.push({ '@type': 'ListItem', position: 3, name: post.title, item: canonicalUrl });
      }
      return {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}/#breadcrumb`,
        itemListElement: items,
      };
    })(),
    // Article (BlogPosting)
    {
        '@type': post.articleType === 'guide' ? 'Article' : 'BlogPosting',
        '@id': canonicalUrl,
        headline: post.seo?.title || post.title,
        description: schemaDescription,
        articleSection: categoryName,
        inLanguage: 'en-US',
        isAccessibleForFree: true,
        ...(keywords.length > 0 ? { keywords: keywords.join(', ') } : {}),
        ...(wordCount > 0 ? { wordCount } : {}),
        author: authorSchema,
        publisher: { '@id': `${baseUrl}/#organization` },
        ...(post.publishedDate ? { datePublished: post.publishedDate } : {}),
        ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
        mainEntityOfPage: { '@id': `${canonicalUrl}/#webpage` },
        ...(includeSpeakable && post.faqs && post.faqs.length > 0 ? {
          speakable: {
            '@type': 'SpeakableSpecification',
            cssSelector: ['.faq-section'],
          },
        } : {}),
        ...(imageUrl
          ? {
              image: {
                '@type': 'ImageObject',
                url: imageUrl,
                width: 1200,
                height: 630,
                caption: post.ogImageAlt || post.title,
              },
            }
          : {}),
    },
  ];

  // Conditional FAQPage
  if (post.faqs && post.faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonicalUrl}/#faq`,
      mainEntity: post.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  // Conditional HowTo
  if (post.howToSteps && post.howToSteps.length > 0) {
    graph.push({
      '@type': 'HowTo',
      '@id': `${canonicalUrl}/#howto`,
      name: post.seo?.title || post.title,
      description: schemaDescription,
      step: post.howToSteps.map((step, idx) => ({
        '@type': 'HowToStep',
        position: idx + 1,
        name: step.name,
        text: step.text,
        ...(step.image ? { image: step.image } : {}),
      })),
    });
  }

  // Conditional Tables (Dataset schema) — opt-in only
  if (includeDataset && post.tables && post.tables.length > 0) {
    post.tables.forEach((table, idx) => {
      const columnNames = table.headers.join(', ');
      const datasetName = table.schemaName || table.name || post.title;
      const datasetDescription = table.schemaDescription ||
        fixProperNouns(`Comparison of ${table.rows.length} entries across ${columnNames} from ${post.title}`);

      graph.push({
        '@type': 'Dataset',
        '@id': `${canonicalUrl}/#dataset-${idx}`,
        name: datasetName,
        description: datasetDescription,
        url: canonicalUrl,
        inLanguage: 'en-US',
        isAccessibleForFree: true,
        creator: { '@type': 'Organization', name: settings.siteName, url: `${baseUrl}/` },
        ...(post.publishedDate ? { datePublished: post.publishedDate } : {}),
        ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
        ...(keywords.length > 0 ? { keywords } : {}),
      });

      if (includeTable) {
        graph.push({
          '@type': 'Table',
          '@id': `${canonicalUrl}/#table-${idx}`,
          name: datasetName,
          description: datasetDescription,
          isPartOf: { '@id': `${canonicalUrl}/#webpage` },
          about: { '@id': `${canonicalUrl}/#dataset-${idx}` },
        });
      }
    });
  }

  // Conditional ItemList for numbered lists
  if (post.itemLists && post.itemLists.length > 0) {
    post.itemLists.forEach((list, idx) => {
      graph.push({
        '@type': 'ItemList',
        '@id': `${canonicalUrl}/#itemlist-${idx}`,
        name: list.name,
        itemListElement: list.items.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item,
        })),
      });
    });
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/<\/script>/gi, '<\\/script>') }}
    />
  );
}
