import Hero from '@/components/medicoreach/email-lists/Hero';
import MainContent from '@/components/medicoreach/email-lists/MainContent';
import FAQ from '@/components/medicoreach/email-lists/FAQ';
import WhoWeServe from '@/components/medicoreach/email-lists/WhoWeServe';

export default function EmailListsPage() {
  return (
    <>
      <Hero />
      <MainContent />
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
