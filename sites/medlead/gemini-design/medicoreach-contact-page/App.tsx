import React, { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ContactSection from './components/ContactSection';
import SupportCards from './components/SupportCards';
import TrustedBy from './components/TrustedBy';
import Footer from './components/Footer';
import FloatingButton from './components/FloatingButton';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize dark mode from system preference or local storage if we were persisting it
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newMode;
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <main>
        <Hero />
        <ContactSection />
        <SupportCards />
        <TrustedBy />
      </main>
      <Footer />
      <FloatingButton />
    </div>
  );
};

export default App;