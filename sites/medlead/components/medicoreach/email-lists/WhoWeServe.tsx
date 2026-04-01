import React from 'react';

const WhoWeServe: React.FC = () => {
  const items = [
    { icon: "biotech", label: "Biotech" },
    { icon: "medical_services", label: "MedTech" },
    { icon: "computer", label: "Software & IT" },
    { icon: "business_center", label: "Consultants" },
    { icon: "cloud", label: "Healthcare SaaS" },
    { icon: "science", label: "Scientific Comms" },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Who We Serve</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col items-center text-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-700 duration-300">
            <div className="bg-teal-50 dark:bg-teal-900/30 p-3 rounded-full mb-3 text-primary">
              <span className="material-symbols-outlined">{item.icon}</span>
            </div>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhoWeServe;
