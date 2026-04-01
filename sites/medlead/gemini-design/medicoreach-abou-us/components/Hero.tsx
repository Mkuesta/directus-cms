import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-surface-light dark:bg-surface-dark overflow-hidden py-20 lg:py-28">
      {/* Background patterns */}
      <div 
        className="absolute inset-0 opacity-40 dark:opacity-10" 
        style={{ 
          backgroundImage: 'radial-gradient(#008080 0.5px, transparent 0.5px)', 
          backgroundSize: '24px 24px' 
        }}
      ></div>
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-teal-200/50 dark:bg-teal-900/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-200/50 dark:bg-blue-900/30 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-teal-100 dark:border-teal-900 rounded-full text-primary text-sm font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-secondary"></span> 10 Years of Excellence
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
              Empowering <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Healthcare Connections</span> Since 2014
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
              We bridge the gap between B2B enterprises and healthcare professionals. Through data precision and innovative technology, we’ve transformed how the medical industry communicates.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button className="bg-primary hover:bg-teal-700 text-white text-lg px-8 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                Meet The Team
              </button>
              <button className="bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 text-lg px-8 py-3.5 rounded-full font-bold transition">
                Our Process
              </button>
            </div>
          </div>

          {/* Image Content */}
          <div className="relative lg:block">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800 transform rotate-2 hover:rotate-0 transition duration-500">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvyausbq2mi4raWyO8CDFdh6uAx5GRVDA8iKiwSwABvesTsmrEihSPzPSdTU-t8xkrMvWWmyXrKrIbnxwwlPH274u-ZtRVqtZCJI6SdrqUAfEdLO25f5fehPVQloHOUR2sKbuKZMu-9SIhxZc0IoFqwdirN-G3mQkJb2Zg7iD0Ny4Cz-Z2FCtZo75I2PGyWWgnXAzs87pNBb-crajF3IpcO9CCXIRGgKjsK7Eb-V9XgCwRzsMjJWz6NWKQWOYDZtiWzkIqqHR-kzs" 
                alt="Collaborative Medical Team" 
                className="w-full h-auto object-cover scale-105" 
              />
              {/* Floating Stat Card */}
              <div className="absolute bottom-8 left-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex items-center gap-4 max-w-xs">
                <div className="bg-teal-100 dark:bg-teal-900/50 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-primary text-2xl">diversity_3</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Team Growth</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">200+ Experts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;