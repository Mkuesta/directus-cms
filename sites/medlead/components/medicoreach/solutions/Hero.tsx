import React from 'react';
import Link from 'next/link';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-[#005c5c] to-teal-500 dark:from-slate-900 dark:to-teal-900 overflow-hidden py-20 lg:py-28">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-teal-100 text-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-secondary"></span> Healthcare Data Solutions
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
            Precision Data for <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-green-300">Every Need</span>
          </h1>
          <p className="text-lg lg:text-xl text-teal-100 leading-relaxed max-w-2xl mx-auto">
            From targeted email campaigns to full-scale market intelligence, our solutions are built to help healthcare marketers connect, convert, and grow.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <Link href="/contact" className="no-underline bg-secondary hover:bg-green-600 text-white text-lg px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">calendar_month</span>
              Book a Demo
            </Link>
            <Link href="/email-lists" className="no-underline bg-white/10 hover:bg-white/20 text-white border border-white/30 text-lg px-8 py-4 rounded-full font-bold transition flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">database</span>
              Browse Data
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
