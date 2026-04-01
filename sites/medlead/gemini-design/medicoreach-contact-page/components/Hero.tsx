import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-surface-light dark:bg-slate-900 py-20 lg:py-24 overflow-hidden transition-colors duration-300">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-40 dark:opacity-10 pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(#008080 0.5px, transparent 0.5px)', 
          backgroundSize: '24px 24px' 
        }}
      ></div>
      
      {/* Blurred Blobs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-teal-200/30 dark:bg-teal-900/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <span className="inline-block py-1 px-3 rounded-full bg-white dark:bg-white/10 border border-teal-100 dark:border-teal-900 text-primary font-semibold text-sm mb-6 shadow-sm">
          Contact Us
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
          Get in Touch
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
          Whether you need precise healthcare data, have questions about our verification process, or want to discuss a custom partnership, our team is ready to assist you.
        </p>
      </div>
    </section>
  );
};

export default Hero;