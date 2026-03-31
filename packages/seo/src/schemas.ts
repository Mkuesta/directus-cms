import type {
  SeoConfig,
  BreadcrumbItem,
  HowToData,
  EventData,
  FAQData,
  LocalBusinessData,
  VideoData,
  ArticleData,
  ProductData,
} from './types.js';

export function generateBreadcrumbList(
  config: SeoConfig,
  items: BreadcrumbItem[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${config.baseUrl}${item.url}`,
    })),
  };
}

export function generateOrganization(config: SeoConfig): Record<string, unknown> {
  const org = config.organization;
  if (!org) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: config.siteName,
      url: config.baseUrl,
    };
  }

  const result: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    url: org.url || config.baseUrl,
  };

  if (org.logo) result.logo = org.logo;
  if (org.sameAs?.length) result.sameAs = org.sameAs;
  if (org.email) result.email = org.email;
  if (org.telephone) result.telephone = org.telephone;
  if (org.legalName) result.legalName = org.legalName;
  if (org.description) result.description = org.description;

  return result;
}

export function generateWebSite(
  config: SeoConfig,
  searchUrl?: string,
): Record<string, unknown> {
  const result: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.siteName,
    url: config.baseUrl,
  };

  if (searchUrl) {
    result.potentialAction = {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: searchUrl,
      },
      'query-input': 'required name=search_term_string',
    };
  }

  return result;
}

export function generateHowTo(data: HowToData): Record<string, unknown> {
  const result: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: data.name,
    step: data.steps.map((step, index) => {
      const s: Record<string, unknown> = {
        '@type': 'HowToStep',
        position: index + 1,
        name: step.name,
        text: step.text,
      };
      if (step.image) s.image = step.image;
      return s;
    }),
  };

  if (data.description) result.description = data.description;
  if (data.totalTime) result.totalTime = data.totalTime;
  if (data.estimatedCost) {
    result.estimatedCost = {
      '@type': 'MonetaryAmount',
      currency: data.estimatedCost.currency,
      value: data.estimatedCost.value,
    };
  }

  return result;
}

export function generateEvent(
  config: SeoConfig,
  data: EventData,
): Record<string, unknown> {
  const result: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: data.name,
    startDate: data.startDate,
  };

  if (data.endDate) result.endDate = data.endDate;
  if (data.description) result.description = data.description;
  if (data.image) result.image = data.image;

  if (data.location) {
    result.location = {
      '@type': 'Place',
      name: data.location.name,
      ...(data.location.address ? { address: data.location.address } : {}),
    };
  }

  if (data.performer) {
    result.performer = { '@type': 'Person', name: data.performer };
  }

  if (data.offers?.length) {
    result.offers = data.offers.map((offer) => ({
      '@type': 'Offer',
      price: offer.price,
      priceCurrency: offer.currency,
      ...(offer.url ? { url: offer.url } : {}),
      ...(offer.availability ? { availability: `https://schema.org/${offer.availability}` } : {}),
    }));
  }

  result.organizer = {
    '@type': 'Organization',
    name: config.siteName,
    url: config.baseUrl,
  };

  return result;
}

export function generateFAQPage(data: FAQData): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
}

export function generateLocalBusiness(
  config: SeoConfig,
  data?: LocalBusinessData,
): Record<string, unknown> {
  const result: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': data?.type || 'LocalBusiness',
    name: data?.name || config.siteName,
    url: config.baseUrl,
  };

  if (data?.address) {
    result.address = {
      '@type': 'PostalAddress',
      ...data.address,
    };
  }

  if (data?.geo) {
    result.geo = {
      '@type': 'GeoCoordinates',
      latitude: data.geo.latitude,
      longitude: data.geo.longitude,
    };
  }

  if (data?.telephone || config.organization?.telephone) {
    result.telephone = data?.telephone || config.organization?.telephone;
  }

  if (data?.openingHours) result.openingHours = data.openingHours;
  if (data?.priceRange) result.priceRange = data.priceRange;
  if (data?.image) result.image = data.image;

  return result;
}

export function generateArticle(
  config: SeoConfig,
  data: ArticleData,
): Record<string, unknown> {
  const result: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.headline,
    url: data.url.startsWith('http') ? data.url : `${config.baseUrl}${data.url}`,
    datePublished: data.datePublished,
    author: {
      '@type': data.authorType || 'Person',
      name: data.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: data.publisherName || config.organization?.name || config.siteName,
      ...(data.publisherLogo || config.organization?.logo
        ? { logo: { '@type': 'ImageObject', url: data.publisherLogo || config.organization?.logo } }
        : {}),
    },
  };

  if (data.description) result.description = data.description;
  if (data.dateModified) result.dateModified = data.dateModified;
  if (data.image) result.image = data.image;
  if (data.section) result.articleSection = data.section;
  if (data.wordCount) result.wordCount = data.wordCount;

  return result;
}

export function buildSchemaGraph(
  ...schemas: Record<string, unknown>[]
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': schemas.map((schema) => {
      const { '@context': _, ...rest } = schema;
      return rest;
    }),
  };
}

export function generateProduct(
  config: SeoConfig,
  data: ProductData,
): Record<string, unknown> {
  const result: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.name,
    description: data.description,
    url: data.url,
    brand: { '@type': 'Brand', name: data.brand || config.siteName },
    offers: {
      '@type': 'Offer',
      url: data.url,
      price: data.price,
      priceCurrency: data.currency,
      availability: data.availability || 'https://schema.org/InStock',
      itemCondition: data.condition || 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: data.seller || config.organization?.name || config.siteName },
    },
  };

  if (data.image) {
    result.image = Array.isArray(data.image) ? data.image : [data.image];
  }
  if (data.sku) result.sku = data.sku;
  if (data.category) result.category = data.category;
  if (data.rating != null && data.reviewCount != null) {
    result.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: data.rating,
      reviewCount: data.reviewCount,
    };
  }

  return result;
}

export function generateVideoObject(data: VideoData): Record<string, unknown> {
  const result: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: data.name,
    description: data.description,
    thumbnailUrl: data.thumbnailUrl,
    uploadDate: data.uploadDate,
  };

  if (data.contentUrl) result.contentUrl = data.contentUrl;
  if (data.embedUrl) result.embedUrl = data.embedUrl;
  if (data.duration) result.duration = data.duration;

  return result;
}
