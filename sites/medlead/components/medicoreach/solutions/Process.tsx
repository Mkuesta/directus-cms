import React from 'react';

const steps = [
  {
    number: '01',
    icon: 'chat',
    title: 'Consultation',
    description: 'We learn about your target audience, campaign goals, and compliance requirements to tailor the perfect data strategy.',
  },
  {
    number: '02',
    icon: 'tune',
    title: 'Data Curation',
    description: 'Our team curates a custom dataset from 4M+ verified records, filtered by specialty, geography, and behavioral intent.',
  },
  {
    number: '03',
    icon: 'verified',
    title: 'Verification',
    description: 'Every record passes multi-step validation including NPI verification, email ping, and phone append for maximum accuracy.',
  },
  {
    number: '04',
    icon: 'rocket_launch',
    title: 'Delivery & Support',
    description: 'Receive your data in any format with dedicated account management, campaign support, and ongoing data refresh.',
  },
];

const Process: React.FC = () => {
  return (
    <section className="py-24 bg-surface-light dark:bg-surface-dark transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-30 dark:opacity-10" style={{ backgroundImage: 'linear-gradient(135deg, transparent 25%, rgba(0,128,128,0.05) 25%, rgba(0,128,128,0.05) 50%, transparent 50%, transparent 75%, rgba(0,128,128,0.05) 75%)', backgroundSize: '40px 40px' }}></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">How It Works</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">From first contact to campaign launch, our streamlined process ensures you get the data you need, fast.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent -translate-x-4 z-0"></div>
              )}
              <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 text-center group hover:shadow-xl transition-shadow">
                <div className="text-5xl font-bold text-primary/10 dark:text-primary/20 absolute top-4 right-4">{step.number}</div>
                <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/50 dark:to-teal-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl">{step.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
