import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { search } from '@/lib/search';
import { SearchResults } from '@mkuesta/search/components';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search results for "${q}" | Medlead` : 'Search | Medlead',
    robots: { index: false },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || '';

  const results = query
    ? await search.search(query).catch(() => ({ results: [], total: 0 }))
    : { results: [], total: 0 };

  return (
    <section className="py-12 bg-gray-50 dark:bg-background-dark min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="no-underline inline-flex items-center gap-1 text-sm text-primary hover:text-teal-700 mb-6">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Search</h1>

        {/* Search Form */}
        <form action="/search" method="get" className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search articles..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-teal-700 transition"
            >
              Search
            </button>
          </div>
        </form>

        {/* Results */}
        {query && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {results.total} result{results.total !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>
        )}

        {results.results.length > 0 ? (
          <SearchResults
            results={results.results}
            query={query}
            className="space-y-6"
            renderResult={(result) => (
              <article className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
                <Link href={result.url} className="no-underline">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white hover:text-primary transition mb-2">
                    {result.title}
                  </h2>
                </Link>
                {result.snippet && (
                  <p
                    className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: result.snippet }}
                  />
                )}
                <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                  <span className="bg-teal-50 dark:bg-teal-900/30 text-primary px-2 py-0.5 rounded capitalize">{result.type}</span>
                  <Link href={result.url} className="no-underline text-primary font-semibold hover:underline">Read more</Link>
                </div>
              </article>
            )}
          />
        ) : query ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-gray-300 text-5xl mb-4 block">search_off</span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No results found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try different keywords or browse our <Link href="/resources" className="text-primary hover:underline">resources</Link>.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
