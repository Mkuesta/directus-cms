import React from 'react';

const ValueProp: React.FC = () => {
  return (
    <section className="py-20 bg-white dark:bg-background-dark transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">We Don&apos;t Just Provide Healthcare Email Lists, We Help You Execute!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              You could be looking for ways to improve your email marketing campaigns, or you are new to email marketing; irrespective of the scenario, you could put the company&apos;s resources to better use by leaving email campaigns to Medlead.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Let Medlead do the heavy-lifting job of running professional and personalized email campaigns.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-teal-50 dark:bg-teal-900 p-3 rounded-lg">
                  <span className="material-symbols-outlined text-primary">email</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">Email Campaigns</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Targeted outreach sequences.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-teal-50 dark:bg-teal-900 p-3 rounded-lg">
                  <span className="material-symbols-outlined text-primary">trending_up</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">Performance Analytics</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Detailed reporting on open rates and clicks.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Animated Graphic */}
          <div className="relative flex justify-center">
            <div className="relative w-80 h-80 rounded-full bg-surface-light dark:bg-surface-dark border-4 border-dashed border-primary flex items-center justify-center animate-[spin_60s_linear_infinite]">
            </div>

            {/* Center Hub */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 p-6 rounded-full shadow-xl z-10">
              <span className="material-symbols-outlined text-6xl text-secondary">hub</span>
            </div>

            {/* Satellites */}
            <div className="absolute top-0 bg-white dark:bg-slate-700 p-3 rounded-full shadow-lg">
              <span className="material-symbols-outlined text-primary text-2xl">mail</span>
            </div>
            <div className="absolute bottom-0 bg-white dark:bg-slate-700 p-3 rounded-full shadow-lg">
              <span className="material-symbols-outlined text-primary text-2xl">wifi</span>
            </div>
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-white dark:bg-slate-700 p-3 rounded-full shadow-lg">
              <span className="material-symbols-outlined text-primary text-2xl">sms</span>
            </div>
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 bg-white dark:bg-slate-700 p-3 rounded-full shadow-lg">
              <span className="material-symbols-outlined text-primary text-2xl">campaign</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProp;
