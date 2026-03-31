import React from 'react';
import type { Product, ProductConfig } from '../types';

interface CategoryListSchemaProps {
  products: Product[];
  config: ProductConfig;
  categoryName?: string;
  categorySlug?: string;
  pageUrl: string;
}

/**
 * Renders JSON-LD structured data for category and listing pages.
 * Includes CollectionPage, ItemList with ListItem entries, and BreadcrumbList.
 */
export function CategoryListSchema({
  products,
  config,
  categoryName,
  categorySlug,
  pageUrl,
}: CategoryListSchemaProps) {
  const websiteId = `${config.baseUrl}/#website`;
  const listingName = config.listingRoute.charAt(0).toUpperCase() + config.listingRoute.slice(1);
  const pageName = categoryName || listingName;
  const description = categoryName
    ? `${categoryName} — alle Produkte bei ${config.siteName}`
    : `Alle Produkte bei ${config.siteName}`;

  // Build breadcrumb items
  const breadcrumbItems: any[] = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: config.baseUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: listingName,
      item: `${config.baseUrl}/${config.listingRoute}`,
    },
  ];

  if (categoryName && categorySlug) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: categoryName,
      item: `${config.baseUrl}/${config.categoryRoute}/${categorySlug}`,
    });
  }

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      // CollectionPage
      {
        '@type': 'CollectionPage',
        name: pageName,
        description,
        url: pageUrl,
        isPartOf: {
          '@id': websiteId,
        },
      },
      // ItemList
      {
        '@type': 'ItemList',
        itemListElement: products.map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: product.title,
          url: `${config.baseUrl}/${config.productRoute}/${product.slug}`,
        })),
      },
      // BreadcrumbList
      {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
