import React from 'react';

const SupportCards: React.FC = () => {
  return (
    <section className="py-16 bg-surface-light dark:bg-slate-900 border-y border-teal-100 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition group">
            <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition">
              <span className="material-symbols-outlined text-3xl">shopping_cart</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sales Inquiry</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Questions about pricing, data availability, or custom lists?</p>
            <a href="#" className="inline-flex items-center text-secondary font-semibold hover:text-green-600 transition">
              Talk to Sales <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
            </a>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition group">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition">
              <span className="material-symbols-outlined text-3xl">support_agent</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Technical Support</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Need help with data integration, API access, or account issues?</p>
            <a href="#" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition font-semibold">
              Get Support <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
            </a>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition group">
            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-110 transition">
              <span className="material-symbols-outlined text-3xl">handshake</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Partnerships</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Interested in reselling data or becoming a technology partner?</p>
            <a href="#" className="inline-flex items-center text-purple-600 hover:text-purple-700 transition font-semibold">
              Partner with Us <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SupportCards;