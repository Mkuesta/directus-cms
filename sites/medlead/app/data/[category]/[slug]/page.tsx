import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/medicoreach/email-lists/Sidebar';
import FAQ from '@/components/medicoreach/email-lists/FAQ';
import WhoWeServe from '@/components/medicoreach/email-lists/WhoWeServe';
import { cms } from '@/lib/cms';
import type { DirectusCategory } from '@mkuesta/core';

interface SubcategoryPageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: SubcategoryPageProps) {
  const { slug } = await params;
  const subcategory = await cms.getCategoryBySlug(slug);

  if (!subcategory) {
    return { title: 'Specialty Not Found' };
  }

  return {
    title: subcategory.seo_title || `${subcategory.name} Email List — Medlead`,
    description: subcategory.seo_description || `Get a verified ${subcategory.name} email list. Reach ${subcategory.name.toLowerCase()} with accurate, up-to-date contact data.`,
    keywords: subcategory.seo_keywords,
  };
}

export async function generateStaticParams() {
  const allCategories = await cms.getAllCategories();

  return allCategories
    .filter((cat) => cat.parent)
    .map((cat) => ({
      category: typeof cat.parent === 'object' && cat.parent ? cat.parent.slug : '',
      slug: cat.slug,
    }))
    .filter((p) => p.category);
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const { slug, category: parentSlug } = await params;

  // First check if this slug is a subcategory
  const subcategory = await cms.getCategoryBySlug(slug);

  // If not a subcategory, check if it's a legacy blog post slug — redirect to /blog
  if (!subcategory) {
    const post = await cms.getPostBySlug(slug);
    if (post) {
      permanentRedirect(`/blog/${post.slug}`);
    }
    notFound();
  }

  // Fetch parent to validate the route
  const parent = await cms.getCategoryBySlug(parentSlug);
  if (!parent) {
    notFound();
  }

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#005c5c] to-teal-600 dark:from-slate-900 dark:to-teal-900 overflow-hidden text-center py-16 transition-colors duration-300">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <nav aria-label="Breadcrumb" className="flex justify-center text-teal-100 text-sm mb-4">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="inline-flex items-center hover:text-white transition">Home</Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-sm mx-1">chevron_right</span>
                  <Link href="/data" className="hover:text-white transition">Data</Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-sm mx-1">chevron_right</span>
                  <Link href={`/data/${parent.slug}`} className="hover:text-white transition">{parent.name}</Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-sm mx-1">chevron_right</span>
                  <span className="text-white font-medium">{subcategory.name}</span>
                </div>
              </li>
            </ol>
          </nav>

          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            {subcategory.name} Email List
          </h1>

          {subcategory.description && (
            <p className="text-lg text-teal-50 max-w-2xl mx-auto mb-6">
              {subcategory.description}
            </p>
          )}

          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-teal-900 bg-white hover:bg-teal-50 transition shadow-lg"
          >
            Get a Free Quote
          </Link>
        </div>
      </section>

      {/* Main Content: 2/3 + 1/3 layout */}
      <section className="py-16 bg-white dark:bg-background-dark transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="w-full lg:w-2/3">
              <div className="prose prose-lg prose-teal dark:prose-invert max-w-none">
                <h2>About Our {subcategory.name} Email List</h2>
                <p>
                  Reach verified {subcategory.name.toLowerCase()} across the United States with Medlead&apos;s
                  accurate, up-to-date contact database. Our {subcategory.name.toLowerCase()} email list includes
                  direct email addresses, phone numbers, mailing addresses, NPI numbers, and more.
                </p>

                <h3>What&apos;s Included</h3>
                <ul>
                  <li>Full Name &amp; Credentials</li>
                  <li>Verified Email Addresses (95%+ deliverability)</li>
                  <li>Direct Phone Numbers</li>
                  <li>Practice / Hospital Affiliation</li>
                  <li>NPI Number</li>
                  <li>Mailing Address (CASS-certified)</li>
                  <li>State License Number</li>
                  <li>Specialty &amp; Subspecialty</li>
                </ul>

                <h3>Why Choose Medlead?</h3>
                <p>
                  All our data is multi-source verified, CASS-certified, and compliant with CAN-SPAM, GDPR,
                  and CCPA regulations. We update our databases monthly to ensure maximum accuracy and deliverability.
                </p>
              </div>
            </div>
            <div className="w-full lg:w-1/3">
              <Sidebar />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom: FAQ + Who We Serve */}
      <section className="py-20 bg-surface-light dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <FAQ />
            <WhoWeServe />
          </div>
        </div>
      </section>
    </>
  );
}
