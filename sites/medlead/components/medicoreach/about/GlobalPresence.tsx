import React from 'react';

const GlobalPresence: React.FC = () => {
  return (
    <section className="py-24 pb-32 bg-white dark:bg-background-dark relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">Global Presence, Local Expertise</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">Our data spans across continents, giving you unmatched access to healthcare professionals worldwide. We understand local regulations and market nuances in every region we serve.</p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-xl">public</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">North America</h4>
                  <p className="text-gray-600 dark:text-gray-400">2M+ verified healthcare contacts across the US and Canada with NPI-validated records.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">euro</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Europe</h4>
                  <p className="text-gray-600 dark:text-gray-400">GDPR-compliant datasets covering 30+ European nations with multi-language support.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-secondary text-xl">globe_asia</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Asia-Pacific</h4>
                  <p className="text-gray-600 dark:text-gray-400">Rapidly expanding coverage across Australia, India, Japan, and Southeast Asia.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxz4BbGrCTLGqOtqzQ0-CAwwJfXQiqsPxbKKVDCm5ZxZQ6vCdSQbqGwPkXUzjTwwDX7R8OkR4d6Zp5ORN9wBfFplD-01S5k5Y2y69rVjZOw3_r7hO0N_WD5QFdITfzphiSthq2Z07FBGBpkxPn5iNJhwi3S1BnhBmMBT37FvgF3Y5WPFrP9x4u3aN0FaXnrkkj4dB-19X3P95XW1SHj9YZIR3vc-LWTjVPJxMHlGq_v-m1DPwbFqe5_gSr3AffyMh2DJA2TLX_FMs" alt="Global Healthcare Network" className="w-full h-auto object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-primary to-secondary p-3 rounded-xl">
                  <span className="material-symbols-outlined text-white text-2xl">language</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">50+</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Countries Covered</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlobalPresence;
