import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MainContent from './components/MainContent';
import FAQ from './components/FAQ';
import WhoWeServe from './components/WhoWeServe';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Initialize dark mode from system preference or local storage simulation
  useEffect(() => {
    // Check if user previously preferred dark mode or system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(false); // Default to light mode based on design, but keep logic ready
    }
  }, []);

  // Toggle Dark Mode Class on HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <main className="flex-grow">
        <Hero />
        <MainContent />
        <section className="py-20 bg-surface-light dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16">
               <FAQ />
               <WhoWeServe />
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Floating CTA */}
      <a 
        href="#" 
        className="fixed bottom-6 right-6 bg-secondary text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition animate-bounce z-50 flex items-center justify-center"
        aria-label="Call Us"
      >
        <span className="material-symbols-outlined">call</span>
      </a>
    </div>
  );
};

export default App;