import React from 'react';

const GlobalReach: React.FC = () => {
  return (
    <section className="py-12 bg-surface-light dark:bg-surface-dark border-y border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Reach Across the Globe</h2>
        
        <div className="flex flex-wrap justify-center gap-3">
          <button className="bg-secondary text-white px-6 py-2 rounded-full text-sm font-semibold shadow">North America</button>
          {['Europe', 'Latin America', 'South America', 'Asia-Pacific (APAC)', 'South & Central Asia', 'Middle East'].map(region => (
            <button key={region} className="bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:text-primary px-6 py-2 rounded-full text-sm font-semibold shadow-sm transition">
              {region}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left text-sm text-gray-500 dark:text-gray-400">
          {[
            'United States of America', 'Canada', 'Greenland', 'Bermuda', 'Saint Pierre and Miquelon'
          ].map(country => (
            <div key={country} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span> {country}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GlobalReach;