import React from 'react';

const Stats: React.FC = () => {
  const stats = [
    { value: '4M+', label: 'Verified Healthcare Contacts', icon: 'contacts' },
    { value: '95%', label: 'Data Accuracy Rate', icon: 'check_circle' },
    { value: '50+', label: 'Countries Covered', icon: 'public' },
    { value: '10K+', label: 'Successful Campaigns', icon: 'campaign' },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-primary via-teal-700 to-teal-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Numbers That Speak</h2>
          <p className="text-lg text-teal-100 max-w-2xl mx-auto">Our impact is measured in the success of our clients and the quality of our data.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                <span className="material-symbols-outlined text-white text-3xl">{stat.icon}</span>
              </div>
              <p className="text-4xl lg:text-5xl font-bold text-white mb-2">{stat.value}</p>
              <p className="text-teal-200 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
