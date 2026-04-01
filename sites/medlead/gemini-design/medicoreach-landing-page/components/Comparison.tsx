import React from 'react';

const Comparison: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50 dark:bg-surface-dark transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-10">Discover Why Emails Run By MedicoReach Get More Open, Clicks, Sales, and Revenue!</h2>
        
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="bg-teal-500 text-white p-4 font-bold text-center border-b md:border-b-0 md:border-r border-teal-600">
              Challenges of Email Marketing
            </div>
            <div className="bg-primary text-white p-4 font-bold text-center">
              Combat Challenges with MedicoReach's Email Campaigns!
            </div>

            {/* Row 1 */}
            <div className="p-6 border-b border-r border-gray-100 dark:border-gray-700 flex items-center gap-3">
              <span className="material-symbols-outlined text-red-400">error_outline</span>
              <span className="text-gray-700 dark:text-gray-300 text-sm">Unclear Campaign Objectives</span>
            </div>
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-teal-50/30 dark:bg-teal-900/10">
              <span className="material-symbols-outlined text-secondary">check_circle</span>
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Dedicated Campaign Managers For Overall Increased Email Campaign Effectiveness.</span>
            </div>

            {/* Row 2 */}
            <div className="p-6 border-b border-r border-gray-100 dark:border-gray-700 flex items-center gap-3">
              <span className="material-symbols-outlined text-red-400">mail_lock</span>
              <span className="text-gray-700 dark:text-gray-300 text-sm">Deliverability Issue</span>
            </div>
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-teal-50/30 dark:bg-teal-900/10">
              <span className="material-symbols-outlined text-secondary">check_circle</span>
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Emails Will Stay Out Of Spam With Warm Up Domains, Optimized Links, Email Layout & Content.</span>
            </div>

            {/* Row 3 */}
            <div className="p-6 border-r border-gray-100 dark:border-gray-700 flex items-center gap-3">
              <span className="material-symbols-outlined text-red-400">filter_alt_off</span>
              <span className="text-gray-700 dark:text-gray-300 text-sm">Poor Segmentation</span>
            </div>
            <div className="p-6 border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-teal-50/30 dark:bg-teal-900/10">
              <span className="material-symbols-outlined text-secondary">check_circle</span>
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Segment ICP Based On Job Role, Industry & 78+ Data Filters.</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <button className="bg-secondary hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transition flex items-center mx-auto gap-2">
            Launch Your Campaign with Us! <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Comparison;