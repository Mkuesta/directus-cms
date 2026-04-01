import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { cms, productCms } from '@/lib/cms';
import ProductPriceCard from '@/components/data/ProductPriceCard';
import { ProductOGMeta } from '@mkuesta/products/components';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://medlead.io').trim();

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    productCms.getProductBySlug(slug),
    cms.getSettings(),
  ]);
  if (!product) return { title: 'Product Not Found' };

  const title = product.title;
  const description = product.seoDescription || product.shortDescription || product.title;
  const url = `${BASE_URL}/data/products/${product.slug}`;
  const ogImage = product.imageUrl || settings.ogImageUrl || undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'MedLead',
      locale: 'en_US',
      ...(ogImage ? { images: [{ url: ogImage, alt: `${title} by MedLead` }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export async function generateStaticParams() {
  const { products } = await productCms.getProducts({ pageSize: 1000 });
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, related, settings] = await Promise.all([
    productCms.getProductBySlug(slug),
    productCms.getRelatedProducts(0, undefined, 3).catch(() => []),
    cms.getSettings(),
  ]);

  if (!product) {
    notFound();
  }

  // Get actual related products (same category, different product)
  const relatedProducts = product.category
    ? await productCms.getRelatedProducts(product.id as number, product.category.slug, 3).catch(() => [])
    : related;

  // Short name for breadcrumb (strip contact count)
  const shortName = product.title.replace(/:\s*\d[\d,]*\+?\s*Verified.*$/i, '').trim();
  const productUrl = `${BASE_URL}/data/products/${product.slug}`;

  const ogImage = product.imageUrl || settings.ogImageUrl || undefined;

  return (
    <>
      {/* OG product type — must use <meta property=> not name= */}
      <ProductOGMeta price={product.price} currency="USD" />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Product',
                name: product.title,
                description: product.seoDescription || product.shortDescription || product.title,
                url: productUrl,
                ...(ogImage ? { image: [ogImage] } : {}),
                brand: { '@type': 'Brand', name: 'MedLead' },
                sku: product.sku || product.slug,
                category: product.category?.name || 'Healthcare Data',
                offers: {
                  '@type': 'Offer',
                  url: productUrl,
                  price: product.price,
                  priceCurrency: 'USD',
                  availability: 'https://schema.org/InStock',
                  itemCondition: 'https://schema.org/NewCondition',
                  seller: { '@type': 'Organization', name: 'MedLead' },
                },
                ...(product.averageRating && product.reviewCount ? {
                  aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: product.averageRating,
                    reviewCount: product.reviewCount,
                  },
                } : {}),
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
                  { '@type': 'ListItem', position: 2, name: 'Data', item: `${BASE_URL}/data` },
                  { '@type': 'ListItem', position: 3, name: shortName, item: productUrl },
                ],
              },
              ...(product.faqs && product.faqs.length > 0 ? [{
                '@type': 'FAQPage',
                mainEntity: product.faqs.map((faq: { question: string; answer: string }) => ({
                  '@type': 'Question',
                  name: faq.question,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.answer,
                  },
                })),
              }] : []),
            ],
          }),
        }}
      />

      {/* Breadcrumb */}
      <section className="bg-[#E6F2F2] dark:bg-slate-900 py-4 border-b border-teal-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:underline">Home</Link>
            <span className="text-gray-300">/</span>
            <Link href="/data" className="text-gray-500 hover:underline">Data</Link>
            <span className="text-gray-300">/</span>
            {product.category && (
              <>
                <span className="text-gray-500">{product.category.name}</span>
                <span className="text-gray-300">/</span>
              </>
            )}
            <span className="text-gray-900 dark:text-white font-medium">{shortName}</span>
          </div>
        </div>
      </section>

      {/* Product Hero */}
      <section className="py-12 bg-white dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left: Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                {product.category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                    {product.category.name}
                  </span>
                )}
                {product.featured && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Featured
                  </span>
                )}
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {product.title}
              </h1>

              {product.shortDescription && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  {product.shortDescription}
                </p>
              )}

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">What's Included</h3>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* File info */}
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                {product.fileFormat && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">description</span>
                    {product.fileFormat}
                  </span>
                )}
                {product.fileSize && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">hard_drive</span>
                    {product.fileSize}
                  </span>
                )}
                {product.sku && (
                  <span>SKU: {product.sku}</span>
                )}
              </div>
            </div>

            {/* Right: Price card */}
            <div className="lg:w-96">
              <ProductPriceCard
                id={product.id}
                title={product.title}
                slug={product.slug}
                price={product.price}
                compareAtPrice={product.compareAtPrice}
              />
            </div>
          </div>
        </div>
      </section>

      {/* SEO Article */}
      {product.seoArticle && (
        <section className="py-12 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="prose prose-lg prose-teal dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: product.seoArticle }}
            />
          </div>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-12 bg-white dark:bg-background-dark border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Related Data Products</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((rp) => (
                <Link key={rp.id} href={`/data/products/${rp.slug}`} className="no-underline group">
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all h-full flex flex-col">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors mb-2">
                      {rp.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex-1 line-clamp-2 mb-3">
                      {rp.shortDescription}
                    </p>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">${rp.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
