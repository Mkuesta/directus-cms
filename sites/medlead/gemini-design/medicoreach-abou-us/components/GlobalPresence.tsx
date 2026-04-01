import React from 'react';

const GlobalPresence: React.FC = () => {
  return (
    <section className="py-20 bg-surface-light dark:bg-surface-dark border-y border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Our Worldwide Presence</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
          Operating across continents to bring you local insights with global reach.
        </p>

        {/* Region Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          <button className="bg-secondary text-white px-6 py-2 rounded-full text-sm font-semibold shadow hover:bg-green-600 transition">North America</button>
          <button className="bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:text-primary px-6 py-2 rounded-full text-sm font-semibold shadow-sm transition hover:scale-105">Europe</button>
          <button className="bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:text-primary px-6 py-2 rounded-full text-sm font-semibold shadow-sm transition hover:scale-105">Latin America</button>
          <button className="bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:text-primary px-6 py-2 rounded-full text-sm font-semibold shadow-sm transition hover:scale-105">South America</button>
          <button className="bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:text-primary px-6 py-2 rounded-full text-sm font-semibold shadow-sm transition hover:scale-105">Asia-Pacific (APAC)</button>
          <button className="bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:text-primary px-6 py-2 rounded-full text-sm font-semibold shadow-sm transition hover:scale-105">Middle East</button>
        </div>

        {/* Map Background */}
        <div 
          className="mt-12 relative w-full h-64 md:h-96 bg-contain bg-no-repeat bg-center opacity-40 dark:opacity-20"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBhj64s69Cnso9GbNLFR8AQxNJ1o-3hxJM9xyokIGCiIjoAri4DTqVjxZDONjIZ8W3PZOkdjAGwrzbfEgQOIXSgMhViyFPWHhwGOyCbA80DgtxpcD-jjgWvTbID72AnlZEYlbGTPqDJqorwGhGqApqJiDnVMhY-_-MkHbuxSPGyAmXEqoAcL-H9aw7cEAMk3A2ELTWtOMe2lSUZgG-ESQYIn5fKDa-Q1TxKH-qWF_O_ByxPVbND_8xTd9jS2UtgzrHY2fpBeVxNR8Q')" }}
        >
          {/* Pulsing Dots */}
          <span className="absolute top-[30%] left-[20%] w-3 h-3 bg-primary rounded-full animate-ping"></span>
          <span className="absolute top-[30%] left-[20%] w-3 h-3 bg-primary rounded-full"></span>
          
          <span className="absolute top-[25%] left-[45%] w-3 h-3 bg-secondary rounded-full animate-ping delay-300"></span>
          <span className="absolute top-[25%] left-[45%] w-3 h-3 bg-secondary rounded-full"></span>
          
          <span className="absolute top-[60%] left-[75%] w-3 h-3 bg-primary rounded-full animate-ping delay-700"></span>
          <span className="absolute top-[60%] left-[75%] w-3 h-3 bg-primary rounded-full"></span>
        </div>

        {/* Locations List */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span> Headquartered in Texas, USA</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span> Ops Center in London, UK</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span> APAC Hub in Singapore</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span> Research Team in Canada</div>
        </div>
      </div>
    </section>
  );
};

export default GlobalPresence;