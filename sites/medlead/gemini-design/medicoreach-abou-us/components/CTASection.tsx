import React from 'react';

const CTASection: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-900 dark:to-cyan-900 py-16">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-white">
          <h3 className="text-3xl font-bold mb-2">Ready to scale your healthcare outreach?</h3>
          <p className="text-teal-100 text-lg">Partner with the team that knows the industry best.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white text-primary hover:bg-gray-100 font-bold py-3 px-8 rounded-full shadow-lg transition">
            Contact Sales
          </button>
          <button className="bg-secondary hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition">
            Get Free Quote
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;