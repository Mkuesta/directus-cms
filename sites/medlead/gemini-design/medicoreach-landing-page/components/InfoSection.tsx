import React from 'react';

const InfoSection: React.FC = () => {
  const items = [
    { icon: 'biotech', label: 'Biotech' },
    { icon: 'groups', label: 'Consultants' },
    { icon: 'factory', label: 'Manufacturers' },
    { icon: 'medical_services', label: 'Medtech' },
    { icon: 'cloud_queue', label: 'Healthcare SaaS' },
    { icon: 'build', label: 'Service Providers' },
    { icon: 'code', label: 'Software & IT' },
    { icon: 'monitor_heart', label: 'Digital Health' },
  ];

  return (
    <>
      <section className="py-16 bg-white dark:bg-background-dark transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Leverage the Best Possible Healthcare Database Available
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
            With our accurate and comprehensive healthcare email lists and medical email lists, we make sure that your messages reach the right prospect to give you better response rates. A product of extensive research and analysis, our highly reliable data helps you target <span className="text-primary font-semibold">healthcare executives</span> and professionals from the industry.
          </p>
        </div>
      </section>

      <section className="pb-12 bg-white dark:bg-background-dark transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-4">
          <button className="bg-secondary text-white px-8 py-3 rounded-md font-medium shadow-md">Who We Serve?</button>
          {['Data Fields', 'Use Cases', 'Multiple Channels'].map((label) => (
            <button key={label} className="bg-primary hover:bg-teal-700 text-white px-8 py-3 rounded-md font-medium shadow-md transition">
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="py-12 bg-surface-light dark:bg-surface-dark transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {items.map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-700 p-8 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 text-center group cursor-pointer border border-transparent hover:border-primary"
              >
                <div className="w-14 h-14 mx-auto bg-teal-50 dark:bg-slate-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary transition">
                  <span className="material-symbols-outlined text-3xl text-primary group-hover:text-white transition">
                    {item.icon}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{item.label}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default InfoSection;