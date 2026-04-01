import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <div className="sticky top-32 transition-all duration-300">
      
      {/* Quote Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-primary p-5 text-center">
          <h3 className="text-xl font-bold text-white mb-1">Get a Free Quote</h3>
          <p className="text-teal-100 text-xs">Build your perfect medical list today.</p>
        </div>
        <div className="p-5">
          <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="sr-only">Full Name</label>
              <input type="text" placeholder="Full Name" className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition text-sm" />
            </div>
            <div>
              <label className="sr-only">Business Email</label>
              <input type="email" placeholder="Business Email" className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition text-sm" />
            </div>
            <div>
              <label className="sr-only">Phone Number</label>
              <input type="tel" placeholder="Phone" className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition text-sm" />
            </div>
            <div className="relative">
              <select className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition text-sm text-gray-500 dark:text-gray-400 appearance-none">
                <option>Select Specialty</option>
                <option selected>Nurses (Oncology)</option>
                <option>Physicians</option>
                <option>Dentists</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2.5 text-gray-400 text-sm pointer-events-none">expand_more</span>
            </div>
            <button className="w-full bg-secondary hover:bg-green-600 text-white font-bold py-2.5 px-4 rounded-md shadow-md hover:shadow-lg transition transform active:scale-95 duration-200 text-sm mt-2">
              Request Quote
            </button>
          </form>
          <p className="text-[10px] text-center text-gray-400 mt-3">No credit card required. Privacy guaranteed.</p>
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 border border-teal-100 dark:border-teal-900 mt-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="bg-white p-2 rounded-full shadow-sm text-primary">
            <span className="material-symbols-outlined">mail</span>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Weekly Insights</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Join 15k+ marketers.</p>
          </div>
        </div>
        <input type="email" placeholder="Enter your email" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:border-primary dark:bg-slate-800 mb-2" />
        <button className="w-full text-xs font-semibold text-primary hover:text-teal-700 border border-primary/20 hover:bg-primary/5 rounded-md py-2 transition">
          Subscribe
        </button>
      </div>

      {/* Tags */}
      <div className="mt-8">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Trending Topics</h4>
        <div className="flex flex-wrap gap-2">
          {['#LeadGeneration', '#EmailMarketing', '#NursesList', '#Oncology', '#HealthcareB2B'].map(tag => (
             <a key={tag} href="#" className="text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded hover:border-primary hover:text-primary transition">
               {tag}
             </a>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default Sidebar;