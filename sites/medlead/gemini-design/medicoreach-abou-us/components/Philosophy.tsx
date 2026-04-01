import React from 'react';

const Philosophy: React.FC = () => {
  return (
    <section className="py-24 relative bg-gray-50 dark:bg-background-dark overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-teal-300/20 dark:bg-teal-900/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-blue-300/20 dark:bg-blue-900/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Core Philosophy</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">The values that drive every connection we facilitate.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="group relative flex flex-col bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 dark:border-slate-700 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,128,128,0.15)] transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/30 text-primary flex items-center justify-center shadow-inner mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-4xl">verified_user</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Data Integrity</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We believe data is only as good as its accuracy. Our multi-step verification process ensures 95% deliverability, building trust in every campaign.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group relative flex flex-col bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 dark:border-slate-700 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,128,128,0.15)] transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/30 text-primary flex items-center justify-center shadow-inner mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-4xl">lightbulb</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Innovation</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Healthcare moves fast, and so do we. By integrating AI and intent signals, we keep our clients ahead of market shifts and emerging trends.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group relative flex flex-col bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 dark:border-slate-700 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,128,128,0.15)] transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/30 text-primary flex items-center justify-center shadow-inner mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-4xl">sentiment_satisfied</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Customer Success</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Your growth is our metric. We don't just sell lists; we partner with marketing teams to optimize outreach strategies and maximize ROI.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Philosophy;