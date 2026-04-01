import React from 'react';

const TrustedBy: React.FC = () => {
  return (
    <section className="py-12 bg-white dark:bg-background-dark transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-8">Trusted by 5,000+ Healthcare Organizations</p>
        <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2 text-xl font-bold text-gray-400"><span className="material-symbols-outlined text-3xl">emergency</span> MedLife</div>
          <div className="flex items-center gap-2 text-xl font-bold text-gray-400"><span className="material-symbols-outlined text-3xl">science</span> BioGenix</div>
          <div className="flex items-center gap-2 text-xl font-bold text-gray-400"><span className="material-symbols-outlined text-3xl">health_and_safety</span> CarePlus</div>
          <div className="flex items-center gap-2 text-xl font-bold text-gray-400"><span className="material-symbols-outlined text-3xl">cardiology</span> HeartSys</div>
          <div className="flex items-center gap-2 text-xl font-bold text-gray-400"><span className="material-symbols-outlined text-3xl">vaccines</span> PharmaCorp</div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;