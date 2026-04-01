import React from 'react';

const Journey: React.FC = () => {
  return (
    <section className="py-24 bg-white dark:bg-background-dark relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">Our Journey</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            From a small data startup to a global healthcare intelligence partner, our path has been defined by a relentless pursuit of accuracy.
          </p>
        </div>
        
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 -translate-x-1/2"></div>
          
          <div className="space-y-12 md:space-y-24">
            
            {/* 2014 */}
            <div className="relative flex flex-col md:flex-row items-start md:items-center group">
              <div className="hidden md:block w-1/2 pr-12 text-right">
                <h3 className="text-2xl font-bold text-primary mb-2">2014</h3>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">The Inception</h4>
                <p className="text-gray-600 dark:text-gray-400">Founded with a single mission: to clean up healthcare data.</p>
              </div>
              <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-surface-light dark:bg-surface-dark border-4 border-primary z-10 group-hover:scale-110 transition-transform"></div>
              <div className="pl-12 md:pl-12 md:w-1/2">
                <div className="md:hidden">
                  <span className="text-primary font-bold text-sm bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded mb-2 inline-block">2014</span>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">The Inception</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-400 md:hidden">Founded with a single mission: to clean up healthcare data.</p>
              </div>
            </div>

            {/* 2018 */}
            <div className="relative flex flex-col md:flex-row items-start md:items-center group">
              <div className="hidden md:block w-1/2 pr-12 text-right">
                 {/* Empty for layout balance */}
              </div>
              <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-surface-light dark:bg-surface-dark border-4 border-secondary z-10 group-hover:scale-110 transition-transform"></div>
              <div className="pl-12 md:pl-12 md:w-1/2">
                <h3 className="hidden md:block text-2xl font-bold text-secondary mb-2">2018</h3>
                <div className="md:hidden">
                  <span className="text-secondary font-bold text-sm bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded mb-2 inline-block">2018</span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Data Expansion</h4>
                <p className="text-gray-600 dark:text-gray-400">Scaled our database to 4M+ records and introduced AI verification.</p>
              </div>
            </div>

            {/* Today */}
            <div className="relative flex flex-col md:flex-row items-start md:items-center group">
              <div className="hidden md:block w-1/2 pr-12 text-right">
                <h3 className="text-2xl font-bold text-primary mb-2">Today</h3>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Global Intelligence</h4>
                <p className="text-gray-600 dark:text-gray-400">Serving Fortune 500s globally with real-time intent data.</p>
              </div>
              <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary border-4 border-white dark:border-gray-800 shadow-lg z-10 group-hover:scale-110 transition-transform"></div>
              <div className="pl-12 md:pl-12 md:w-1/2">
                <div className="md:hidden">
                  <span className="text-primary font-bold text-sm bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded mb-2 inline-block">Today</span>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Global Intelligence</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-400 md:hidden">Serving Fortune 500s globally with real-time intent data.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Journey;