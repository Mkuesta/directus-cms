import React from 'react';

const Philosophy: React.FC = () => {
  return (
    <section className="py-24 bg-surface-light dark:bg-surface-dark relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-30 dark:opacity-10" style={{ backgroundImage: 'linear-gradient(135deg, transparent 25%, rgba(0,128,128,0.05) 25%, rgba(0,128,128,0.05) 50%, transparent 50%, transparent 75%, rgba(0,128,128,0.05) 75%)', backgroundSize: '40px 40px' }}></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">Our Philosophy</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Every decision we make is guided by three core principles that define who we are.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 group">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/50 dark:to-teal-800/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-3xl">verified</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Data Integrity First</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">We don&apos;t cut corners. Every record in our database passes through a multi-step verification process ensuring 95%+ accuracy across all datasets.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl">handshake</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Client Partnership</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">We don&apos;t just deliver data; we become an extension of your marketing team. Your success metrics are our KPIs.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 group">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-secondary text-3xl">verified_user</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Ethical Compliance</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Full CAN-SPAM, GDPR, and CCPA compliance isn&apos;t optional for us. It&apos;s the foundation upon which every product is built.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Philosophy;
