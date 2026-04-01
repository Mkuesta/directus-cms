import { notFound, permanentRedirect } from 'next/navigation';
import CategoryHero from '@/components/medicoreach/data/CategoryHero';
import SubcategoryCard from '@/components/medicoreach/data/SubcategoryCard';
import { cms } from '@/lib/cms';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category } = await params;
  const cat = await cms.getCategoryWithChildren(category);

  if (!cat) {
    return { title: 'Category Not Found' };
  }

  return {
    title: `${cat.name} — Healthcare Data & Email Lists`,
    description: cat.seo_description || cat.description || `Browse all ${cat.name} specialties and email lists.`,
  };
}

export async function generateStaticParams() {
  const categories = await cms.getTopLevelCategories();
  return categories.map((cat) => ({ category: cat.slug }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const cat = await cms.getCategoryWithChildren(category);

  // If not a valid category, check if it's a legacy post slug and redirect to /blog
  if (!cat) {
    const post = await cms.getPostBySlug(category);
    if (post) {
      permanentRedirect(`/blog/${post.slug}`);
    }
    notFound();
  }

  const children = cat.children || [];

  return (
    <>
      <CategoryHero category={cat} childCount={children.length} />
      <section className="py-12 bg-gray-50 dark:bg-background-dark min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {cat.name} Specialties
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Select a specialty to view the available email list.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {children.map((child) => (
              <SubcategoryCard
                key={child.id}
                subcategory={child}
                parentSlug={cat.slug}
              />
            ))}
          </div>

          {children.length === 0 && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-gray-300 text-5xl mb-4 block">folder_open</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No specialties yet</h3>
              <p className="text-gray-500 dark:text-gray-400">Check back soon for new data.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
