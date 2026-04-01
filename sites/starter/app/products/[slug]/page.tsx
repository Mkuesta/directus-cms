import { notFound } from 'next/navigation';
import { cms, productCms } from '@/lib/cms';
import { ProductOGMeta } from '@mkuesta/products/components';
import { BASE_URL, PRODUCT_ROUTE } from '@/lib/directus/config';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return productCms.getProductMetadata(slug);
}

export async function generateStaticParams() {
  const { products } = await productCms.getProducts({ pageSize: 1000 });
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    productCms.getProductBySlug(slug),
    cms.getSettings(),
  ]);

  if (!product) notFound();

  const productUrl = `${BASE_URL}/${PRODUCT_ROUTE}/${product.slug}`;
  const ogImage = product.imageUrl || settings.ogImageUrl;

  return (
    <>
      <ProductOGMeta price={product.price} currency="USD" />

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
                brand: { '@type': 'Brand', name: settings.siteName },
                sku: product.sku || product.slug,
                category: product.category?.name || 'Products',
                offers: {
                  '@type': 'Offer',
                  url: productUrl,
                  price: product.price,
                  priceCurrency: 'USD',
                  availability: 'https://schema.org/InStock',
                  itemCondition: 'https://schema.org/NewCondition',
                  seller: { '@type': 'Organization', name: settings.siteName },
                },
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
                  { '@type': 'ListItem', position: 2, name: 'Products', item: `${BASE_URL}/${PRODUCT_ROUTE}` },
                  { '@type': 'ListItem', position: 3, name: product.title, item: productUrl },
                ],
              },
              ...(product.faqs && product.faqs.length > 0 ? [{
                '@type': 'FAQPage',
                mainEntity: product.faqs.map((faq: any) => ({
                  '@type': 'Question',
                  name: faq.question,
                  acceptedAnswer: { '@type': 'Answer', text: faq.answer },
                })),
              }] : []),
            ],
          }).replace(/<\/script>/gi, '<\\/script>'),
        }}
      />

      <article>
        <h1>{product.title}</h1>
        <p>{product.shortDescription}</p>
        <p><strong>${product.price}</strong></p>
        {product.seoArticle && (
          <div dangerouslySetInnerHTML={{ __html: product.seoArticle }} />
        )}
      </article>
    </>
  );
}
