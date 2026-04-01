import React from 'react';

const Stats: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50 dark:bg-surface-dark">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">Our Impact by the Numbers</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "10+", label: "Years of Experience" },
            { value: "9M+", label: "Healthcare Contacts" },
            { value: "5k+", label: "Companies Served" },
            { value: "95%", label: "Deliverability Rate" }
          ].map((stat, index) => (
            <div key={index} className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md transition">
              <p className="text-5xl font-bold text-primary mb-3">{stat.value}</p>
              <p className="text-gray-600 dark:text-gray-400 font-medium text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <button className="bg-secondary hover:bg-green-600 text-white font-bold py-4 px-10 rounded-full shadow-lg transition flex items-center mx-auto gap-2">
            See Our Data Cards <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Stats;