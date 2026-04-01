import React from 'react';

const Stats: React.FC = () => {
  const stats = [
    { value: '10+', label: 'Years of Industry Experience' },
    { value: '9M+', label: 'Contacts' },
    { value: '250+', label: 'Specialized Healthcare Categories' },
    { value: '78+', label: 'Data Filters' },
    { value: '100M+', label: 'Verified Data Sources' },
    { value: '5,000', label: 'Companies Served' },
    { value: '100+', label: 'Countries Covered' },
    { value: '95%', label: 'Deliverability Rate' },
  ];

  return (
    <section className="py-20 bg-white dark:bg-background-dark transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">Why MedicoReach?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="p-6 bg-gray-50 dark:bg-surface-dark rounded-xl transition-colors duration-300">
              <p className="text-5xl font-bold text-primary mb-2">{stat.value}</p>
              <p className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 max-w-4xl mx-auto">
          <div className="p-6 bg-gray-50 dark:bg-surface-dark rounded-xl flex items-center justify-center gap-4 transition-colors duration-300">
            <span className="material-symbols-outlined text-4xl text-primary">verified_user</span>
            <span className="text-gray-700 dark:text-gray-200 font-semibold">Fully Complaint</span>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-surface-dark rounded-xl flex items-center justify-center gap-4 transition-colors duration-300">
            <span className="material-symbols-outlined text-4xl text-primary">description</span>
            <span className="text-gray-700 dark:text-gray-200 font-semibold">Multiple Format Access</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;