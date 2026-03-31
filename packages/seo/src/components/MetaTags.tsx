import React from 'react';
import type { MetaTagResult } from '../types.js';

export interface MetaTagsProps {
  meta: MetaTagResult;
}

/**
 * Renders meta tags as HTML elements.
 * For use in Next.js head or custom head management.
 */
export function MetaTags({ meta }: MetaTagsProps) {
  return (
    <>
      {meta.description && <meta name="description" content={meta.description} />}
      {meta.keywords && <meta name="keywords" content={meta.keywords} />}
      {meta.robots && <meta name="robots" content={meta.robots} />}
      {meta.alternates?.canonical && <link rel="canonical" href={meta.alternates.canonical} />}
      {meta.alternates?.languages &&
        Object.entries(meta.alternates.languages).map(([locale, url]) => (
          <link key={locale} rel="alternate" hrefLang={locale} href={url} />
        ))}
      {meta.openGraph && (
        <>
          <meta property="og:title" content={meta.openGraph.title} />
          {meta.openGraph.description && <meta property="og:description" content={meta.openGraph.description} />}
          {meta.openGraph.url && <meta property="og:url" content={meta.openGraph.url} />}
          <meta property="og:site_name" content={meta.openGraph.siteName} />
          {meta.openGraph.type && <meta property="og:type" content={meta.openGraph.type} />}
          {meta.openGraph.images?.map((img, i) => (
            <meta key={i} property="og:image" content={img.url} />
          ))}
        </>
      )}
      {meta.twitter && (
        <>
          <meta name="twitter:card" content={meta.twitter.card} />
          <meta name="twitter:title" content={meta.twitter.title} />
          {meta.twitter.description && <meta name="twitter:description" content={meta.twitter.description} />}
          {meta.twitter.creator && <meta name="twitter:creator" content={meta.twitter.creator} />}
          {meta.twitter.images?.map((img, i) => (
            <meta key={i} name="twitter:image" content={img} />
          ))}
        </>
      )}
    </>
  );
}
