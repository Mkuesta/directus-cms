import React from 'react';

const Partners: React.FC = () => {
  const partners = [
    { icon: 'science', name: 'BioGen' },
    { icon: 'medication', name: 'PharmaCorp' },
    { icon: 'health_and_safety', name: 'MedSafe' },
    { icon: 'monitor_heart', name: 'HeartBeat' },
    { icon: 'biotech', name: 'GenX' },
  ];

  return (
    <section className="py-10 bg-gray-50 dark:bg-surface-dark border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-6">
          Proud Partners of Healthcare Innovators
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {partners.map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-xl font-bold text-gray-400">
              <span className="material-symbols-outlined">{p.icon}</span> {p.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;