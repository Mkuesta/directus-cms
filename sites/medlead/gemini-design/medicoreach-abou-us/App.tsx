import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Journey from './components/Journey';
import Philosophy from './components/Philosophy';
import GlobalPresence from './components/GlobalPresence';
import Leadership from './components/Leadership';
import Stats from './components/Stats';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize dark mode based on system preference or default
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  // Update HTML class when dark mode changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <main className="flex-grow">
        <Hero />
        <Journey />
        <Philosophy />
        <GlobalPresence />
        <Leadership />
        <Stats />
        <CTASection />
      </main>
      <Footer />
      
      {/* Floating Action Button */}
      <a 
        href="#" 
        className="fixed bottom-6 right-6 bg-secondary text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition animate-bounce z-50 flex items-center justify-center"
        aria-label="Call Now"
      >
        <span className="material-symbols-outlined">call</span>
      </a>
    </div>
  );
};

export default App;