import React from 'react';

interface ProductOGMetaProps {
  price: number;
  currency: string;
}

/**
 * Renders OG meta tags with property= attribute (not name=).
 * Next.js `other` metadata always renders name=, but OG protocol requires property=.
 */
export function ProductOGMeta({ price, currency }: ProductOGMetaProps) {
  return (
    <>
      <meta property="og:type" content="product" />
      <meta property="product:price:amount" content={Number(price).toFixed(2)} />
      <meta property="product:price:currency" content={currency} />
    </>
  );
}
