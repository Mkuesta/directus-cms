import Link from 'next/link';
import DataPageClient from '@/components/medicoreach/data/DataPageClient';
import { cms, productCms } from '@/lib/cms';

export const metadata = {
  title: 'Healthcare Data & Email Lists | Medlead',
  description: 'Verified healthcare professional email databases. Physicians, nurses, dentists, pharmacists, and executives. 95%+ deliverability, CAN-SPAM compliant.',
};

export default async function DataPage() {
  const [topCategories, { products }, productCategories] = await Promise.all([
    cms.getTopLevelCategories(),
    productCms.getProducts({ pageSize: 50, sort: 'featured' }),
    productCms.getProductCategories(),
  ]);

  // Flatten: pass the second level (Physicians, Surgeons, Dentists...) as top-level
  // so the table shows Physicians → Cardiologists, Dermatologists, etc.
  const specialtyCategories = topCategories.flatMap((cat) => cat.children || []);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#005c5c] to-teal-600 dark:from-slate-900 dark:to-teal-900 overflow-hidden text-center py-16">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            Healthcare Data & Email Lists
          </h1>
          <p className="text-lg text-teal-50 max-w-2xl mx-auto mb-6">
            Verified, compliant contact databases for physicians, nurses, dentists, pharmacists, and healthcare executives.
          </p>
          <Link
            href="/contact"
            className="no-underline inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-teal-900 bg-white hover:bg-teal-50 transition shadow-lg"
          >
            Get a Free Quote
          </Link>
        </div>
      </section>

      {/* Specialty Categories — each card shows subspecialties */}
      {specialtyCategories.length > 0 && <DataPageClient categories={specialtyCategories} />}

      {/* Products */}
      <section className="py-12 bg-gray-50 dark:bg-background-dark min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Ready-to-Download Email Lists
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
              Verified, compliant healthcare contact databases. Download instantly in CSV format.
            </p>
          </div>

          {/* Category pills */}
          {productCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary text-white">
                All Products
              </span>
              {productCategories.map((cat) => (
                <span
                  key={cat.id}
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}

          {/* Products grid */}
          {products.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/data/products/${product.slug}`}
                  className="no-underline group"
                >
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                        {product.category?.name || 'Data'}
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          {Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors mb-2">
                      {product.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex-1 line-clamp-2 mb-4">
                      {product.shortDescription}
                    </p>
                    <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">${product.price}</span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="text-sm text-gray-400 line-through ml-2">${product.compareAtPrice}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {product.fileFormat && <span>{product.fileFormat}</span>}
                        {product.featured && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                            Popular
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-gray-300 text-5xl mb-4 block">database</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Products coming soon</h3>
              <p className="text-gray-500 dark:text-gray-400">Check back soon for new data products.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
