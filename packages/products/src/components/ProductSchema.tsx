import React from 'react';
import type { Product, ProductConfig, ProductFAQ, ProductHowToStep, ProductTable, ProductItemList } from '../types';

interface ProductSchemaProps {
  product: Product;
  config: ProductConfig;
  displayTitle?: string;
  faqs?: ProductFAQ[];
  howToSteps?: ProductHowToStep[];
  tables?: ProductTable[];
  itemLists?: ProductItemList[];
}

/**
 * Renders JSON-LD structured data for a product page.
 * Includes Product (with Offer), BreadcrumbList, WebPage, WebSite, Organization, and optional Person.
 */
export function ProductSchema({ product, config, displayTitle, faqs: faqsOverride, howToSteps: howToOverride, tables: tablesOverride, itemLists: itemListsOverride }: ProductSchemaProps) {
  const faqs = faqsOverride ?? product.faqs;
  const howToSteps = howToOverride ?? product.howToSteps;
  const tables = tablesOverride ?? product.tables;
  const itemLists = itemListsOverride ?? product.itemLists;
  const productUrl = `${config.baseUrl}/${config.productRoute}/${product.slug}`;
  const title = displayTitle || product.title;
  const description = product.shortDescription || extractTextFromRichText(product.description);
  const organizationId = `${config.baseUrl}/#organization`;
  const websiteId = `${config.baseUrl}/#website`;
  const productId = `${productUrl}#product`;
  const webpageId = `${productUrl}#webpage`;
  const breadcrumbId = `${productUrl}#breadcrumb`;
  const authorId = `${config.baseUrl}/#author`;

  // Collect ALL images — all preview images + main image (deduplicated)
  const imageUrls: string[] = [];
  if (product.previewImageUrls.length > 0) {
    imageUrls.push(...product.previewImageUrls);
  }
  if (product.imageUrl && !imageUrls.includes(product.imageUrl)) {
    imageUrls.push(product.imageUrl);
  }

  // Build additionalProperty for digital product attributes
  const additionalProperties: any[] = [];
  if (product.fileFormat) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'fileFormat',
      value: product.fileFormat,
    });
  }
  if (product.fileSize) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'fileSize',
      value: product.fileSize,
    });
  }

  // Build the Product entity
  const productEntity: any = {
    '@type': 'Product',
    '@id': productId,
    name: title,
    description,
    ...(imageUrls.length > 0 ? { image: imageUrls } : {}),
    url: productUrl,
    sku: product.sku || String(product.id),
    brand: {
      '@type': 'Brand',
      name: config.siteName,
    },
    manufacturer: { '@id': organizationId },
    mainEntityOfPage: {
      '@id': webpageId,
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: config.currency,
      price: Number(product.price).toFixed(2),
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': organizationId },
    },
  };

  // Category
  if (product.category) {
    productEntity.category = product.category.name;
  }

  // Target audience
  if (product.targetAudience) {
    productEntity.audience = {
      '@type': 'Audience',
      audienceType: product.targetAudience,
    };
  }

  // Additional properties (digital product attributes)
  if (additionalProperties.length > 0) {
    productEntity.additionalProperty = additionalProperties;
  }

  // Build Organization entity from config
  const org = config.organization;
  const organizationEntity: any = {
    '@type': 'Organization',
    '@id': organizationId,
    name: config.siteName,
    url: config.baseUrl,
  };
  if (org?.logo) {
    organizationEntity.logo = {
      '@type': 'ImageObject',
      url: org.logo,
    };
  }
  if (org?.sameAs?.length) organizationEntity.sameAs = org.sameAs;
  if (org?.email) organizationEntity.email = org.email;
  if (org?.telephone) organizationEntity.telephone = org.telephone;
  if (org?.legalName) organizationEntity.legalName = org.legalName;
  if (org?.description) organizationEntity.description = org.description;

  // Build Person entity for author
  const personEntity = config.defaultAuthor ? {
    '@type': 'Person',
    '@id': authorId,
    name: config.defaultAuthor,
    ...(config.defaultAuthorTitle ? { jobTitle: config.defaultAuthorTitle } : {}),
    worksFor: { '@id': organizationId },
  } : null;

  // Build FAQPage entity when faqs are provided
  const faqEntity = faqs && faqs.length > 0 ? {
    '@type': 'FAQPage' as const,
    '@id': productUrl + '#faq',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question' as const,
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer' as const,
        text: faq.answer,
      },
    })),
  } : null;

  // Build the @graph
  const graph: any[] = [
    // Organization
    organizationEntity,
    // Person (author)
    ...(personEntity ? [personEntity] : []),
    // WebSite
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: config.baseUrl,
      name: config.siteName,
      publisher: { '@id': organizationId },
    },
    // WebPage
    {
      '@type': 'WebPage',
      '@id': webpageId,
      url: productUrl,
      name: title,
      description,
      isPartOf: { '@id': websiteId },
      about: { '@id': productId },
      ...(config.defaultAuthor ? { author: { '@id': authorId } } : {}),
      ...(product.updatedAt ? { dateModified: product.updatedAt } : {}),
      breadcrumb: { '@id': breadcrumbId },
      ...(faqs && faqs.length > 0 ? {
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['.faq-section'],
        },
      } : {}),
    },
    // Product
    productEntity,
    // BreadcrumbList
    {
      '@type': 'BreadcrumbList',
      '@id': breadcrumbId,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: config.baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: config.listingRoute.charAt(0).toUpperCase() + config.listingRoute.slice(1),
          item: `${config.baseUrl}/${config.listingRoute}`,
        },
        ...(product.category
          ? [
              {
                '@type': 'ListItem',
                position: 3,
                name: product.category.name,
                item: `${config.baseUrl}/${config.categoryRoute}/${product.category.slug}`,
              },
              {
                '@type': 'ListItem',
                position: 4,
                name: title,
                item: productUrl,
              },
            ]
          : [
              {
                '@type': 'ListItem',
                position: 3,
                name: title,
                item: productUrl,
              },
            ]),
      ],
    },
  ];

  // Conditionally add FAQPage entity
  if (faqEntity) graph.push(faqEntity);

  // HowTo entity
  if (howToSteps && howToSteps.length > 0) {
    graph.push({
      '@type': 'HowTo',
      '@id': productUrl + '#howto',
      name: title,
      description,
      step: howToSteps.map((step, idx) => ({
        '@type': 'HowToStep',
        position: idx + 1,
        name: step.name,
        text: step.text,
        ...(step.image ? { image: step.image } : {}),
      })),
    });
  }

  // Table entities
  if (tables && tables.length > 0) {
    tables.forEach((table, idx) => {
      const tableName = table.schemaName || table.name || title;
      const tableDescription = table.schemaDescription ||
        `Comparison of ${table.rows.length} entries across ${table.headers.join(', ')}`;

      graph.push({
        '@type': 'Table',
        '@id': productUrl + '#table-' + idx,
        name: tableName,
        description: tableDescription,
        isPartOf: { '@id': productUrl },
      });
    });
  }

  // ItemList entities
  if (itemLists && itemLists.length > 0) {
    itemLists.forEach((list, idx) => {
      graph.push({
        '@type': 'ItemList',
        '@id': productUrl + '#itemlist-' + idx,
        name: list.name,
        itemListElement: list.items.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item,
        })),
      });
    });
  }

  const schema = {
    '@context': 'https://schema.org',
    '@graph': graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function extractTextFromRichText(richText: any): string {
  if (!richText) return '';
  if (typeof richText === 'string') return richText;

  if (Array.isArray(richText)) {
    return richText
      .map((node: any) => {
        if (node.type === 'text') return node.text;
        if (node.children) return extractTextFromRichText(node.children);
        return '';
      })
      .join(' ');
  }

  if (richText.children) {
    return extractTextFromRichText(richText.children);
  }

  return '';
}
