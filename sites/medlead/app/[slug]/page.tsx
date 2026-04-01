import { notFound } from 'next/navigation';
import Link from 'next/link';
import { pages } from '@/lib/pages';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    return await pages.getPageMetadata(slug);
  } catch {
    return {};
  }
}

export async function generateStaticParams() {
  try {
    return await pages.getPageStaticParams();
  } catch {
    return [];
  }
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let page;
  try {
    page = await pages.getPage(slug);
  } catch {
    notFound();
  }

  if (!page) notFound();

  const formattedDate = page.updatedDate || page.publishedDate
    ? new Date(page.updatedDate || page.publishedDate!).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#005c5c] to-teal-500 dark:from-slate-900 dark:to-teal-900 overflow-hidden py-16 lg:py-20">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
            <span className="material-symbols-outlined text-white text-3xl">article</span>
          </div>
          <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4">{page.title}</h1>
          {formattedDate && (
            <p className="text-teal-100 text-lg">Last updated: {formattedDate}</p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24 bg-white dark:bg-background-dark transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-a:text-primary hover:prose-a:text-teal-700 prose-strong:text-gray-900 dark:prose-strong:text-white prose-li:text-gray-600 dark:prose-li:text-gray-300"
            dangerouslySetInnerHTML={{ __html: page.html || '' }}
          />

          {/* CTA */}
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-primary hover:bg-teal-700 text-white px-8 py-3 rounded-full font-bold transition"
            >
              <span className="material-symbols-outlined text-xl">mail</span>
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
