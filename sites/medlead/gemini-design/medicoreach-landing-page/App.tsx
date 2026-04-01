import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Partners from './components/Partners';
import InfoSection from './components/InfoSection';
import Marketplace from './components/Marketplace';
import GlobalReach from './components/GlobalReach';
import ValueProp from './components/ValueProp';
import Comparison from './components/Comparison';
import Stats from './components/Stats';
import Testimonials from './components/Testimonials';
import CaseStudies from './components/CaseStudies';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className="min-h-screen flex flex-col">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main className="flex-grow">
        <Hero />
        <Partners />
        <InfoSection />
        <Marketplace />
        <GlobalReach />
        <ValueProp />
        <Comparison />
        <Stats />
        <Testimonials />
        <CaseStudies />
      </main>
      <Footer />
      
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