import React from 'react';

interface CategoryCardProps {
  icon: string;
  trend: string;
  title: string;
  count: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ icon, trend, title, count }) => (
  <div className="group relative flex flex-col bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 dark:border-slate-700 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,128,128,0.15)] transition-all duration-300 hover:-translate-y-1">
    <div className="flex justify-between items-start mb-6">
      <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-900/30 text-primary flex items-center justify-center shadow-inner">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2.5 py-1 rounded-full">
        <span className="material-symbols-outlined text-[14px]">trending_up</span> {trend}
      </span>
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{title}</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">{count}</p>
    <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-700/50">
      <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold text-sm hover:bg-primary hover:border-primary hover:text-white transition-all shadow-sm group-hover:shadow-md">
        Quick View
      </button>
    </div>
  </div>
);

const Marketplace: React.FC = () => {
  const cards = [
    { icon: 'badge', trend: '2.4%', title: 'AMA Physicians', count: '1,000,000+ Contacts' },
    { icon: 'local_hospital', trend: '4.1%', title: 'Primary Care', count: '207,491 Contacts' },
    { icon: 'nutrition', trend: '1.2%', title: 'Reg. Dieticians', count: '90,720 Contacts' },
    { icon: 'diversity_1', trend: '3.5%', title: 'Family Medicine', count: '90,379 Contacts' },
    { icon: 'cardiology', trend: '0.8%', title: 'Internal Medicine', count: '83,295 Contacts' },
    { icon: 'stethoscope', trend: '1.5%', title: 'General Practice', count: '83,295 Contacts' },
    { icon: 'accessibility_new', trend: '5.2%', title: 'Osteopathic Phys.', count: '70,324 Contacts' },
  ];

  return (
    <section className="py-24 relative bg-slate-50 dark:bg-background-dark overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-teal-200/30 dark:bg-teal-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Marketplace of Healthcare Intelligence</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">Browse our extensive catalog of verified healthcare professionals. Filter by category or search specifically to build your perfect pipeline.</p>
        </div>

        <div className="flex flex-col xl:flex-row justify-between items-center gap-6 mb-12">
          {/* Tabs */}
          <div className="flex p-1.5 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm overflow-x-auto max-w-full">
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white shadow-md transition-all whitespace-nowrap">
              <span className="material-symbols-outlined text-[20px]">medical_services</span>
              <span className="font-semibold text-sm">Medical</span>
            </button>
            {[
              { label: 'Dental', icon: 'dentistry' },
              { label: 'Admin', icon: 'admin_panel_settings' },
              { label: 'Executive', icon: 'supervisor_account' }
            ].map(tab => (
              <button key={tab.label} className="flex items-center gap-2 px-6 py-3 rounded-xl hover:bg-white/50 dark:hover:bg-slate-700/50 text-gray-600 dark:text-gray-300 font-medium text-sm transition-all whitespace-nowrap group">
                <span className="material-symbols-outlined text-[20px] text-gray-400 group-hover:text-primary transition-colors">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-gray-400">search</span>
            </div>
            <input 
              type="text" 
              className="block w-full pl-11 pr-4 py-3.5 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition-shadow text-gray-900 dark:text-white" 
              placeholder="Search specialties, job titles, or keywords..." 
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cards.map((card, idx) => (
            <CategoryCard key={idx} {...card} />
          ))}
          
          {/* View All Card */}
          <div className="group relative flex flex-col justify-center items-center text-center bg-teal-50/80 dark:bg-slate-700/80 backdrop-blur-xl border-2 border-dashed border-teal-200 dark:border-slate-600 rounded-3xl p-6 hover:bg-teal-100/80 dark:hover:bg-slate-700 transition-all cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-600 text-primary flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">add</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">View All Categories</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Explore 20+ more specialty databases</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Marketplace;