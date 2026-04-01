import React from 'react';
import Link from 'next/link';

const CTASection: React.FC = () => {
  return (
    <section className="py-24 bg-surface-light dark:bg-surface-dark relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-br from-white to-teal-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-12 lg:p-16 shadow-xl border border-teal-100 dark:border-teal-900/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-200/30 dark:bg-teal-900/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl -ml-32 -mb-32"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-8 shadow-lg">
              <span className="material-symbols-outlined text-white text-4xl">handshake</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">Ready to Find Your Solution?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Tell us about your goals and we&apos;ll recommend the right data package for your team. No commitment, no pressure — just expert guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="no-underline bg-primary hover:bg-teal-700 text-white text-lg px-10 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                  Get Started
                </span>
              </Link>
              <Link href="/email-lists" className="no-underline bg-white hover:bg-gray-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 text-lg px-10 py-4 rounded-full font-bold transition">
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-xl">search</span>
                  Explore Data
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
