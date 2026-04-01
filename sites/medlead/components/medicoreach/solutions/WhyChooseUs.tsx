import React from 'react';

const reasons = [
  { icon: 'shield', title: '95% Data Accuracy', description: 'Multi-step verification ensures industry-leading accuracy across every dataset we deliver.' },
  { icon: 'speed', title: 'Real-Time Updates', description: 'Our databases are continuously updated so you always work with the freshest records available.' },
  { icon: 'lock', title: 'Full Compliance', description: 'Built-in CAN-SPAM, GDPR, and CCPA compliance on every record. No guesswork required.' },
  { icon: 'support_agent', title: 'Dedicated Support', description: 'A named account manager works with you from onboarding through every campaign launch.' },
  { icon: 'public', title: '50+ Countries', description: 'Global healthcare data spanning North America, Europe, and Asia-Pacific markets.' },
  { icon: 'insights', title: 'Proven ROI', description: 'Our clients see an average 3x improvement in campaign response rates versus industry benchmarks.' },
];

const WhyChooseUs: React.FC = () => {
  return (
    <section className="py-24 bg-white dark:bg-background-dark transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">Why Medlead?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              We don&apos;t just sell data. We deliver a competitive advantage backed by verification, compliance, and expert support at every step.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {reasons.map((reason, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-50 dark:bg-teal-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl">{reason.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{reason.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{reason.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-primary via-teal-700 to-teal-900 rounded-3xl p-10 lg:p-12 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              <div className="relative z-10 space-y-8">
                <h3 className="text-2xl font-bold">By the Numbers</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-4xl font-bold text-teal-200">4M+</p>
                    <p className="text-teal-100 text-sm mt-1">Verified Contacts</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-teal-200">95%</p>
                    <p className="text-teal-100 text-sm mt-1">Accuracy Rate</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-teal-200">10K+</p>
                    <p className="text-teal-100 text-sm mt-1">Campaigns Run</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-teal-200">50+</p>
                    <p className="text-teal-100 text-sm mt-1">Countries</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/20">
                  <p className="text-teal-100 text-sm leading-relaxed">&ldquo;Medlead transformed our outreach. We saw a 280% increase in qualified leads within the first quarter.&rdquo;</p>
                  <p className="text-white font-semibold mt-2 text-sm">— VP Marketing, Fortune 500 Pharma</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
