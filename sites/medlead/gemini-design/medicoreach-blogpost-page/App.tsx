import React, { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BlogPost from './components/BlogPost';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import SocialSidebar from './components/SocialSidebar';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      
      <main className="flex-grow">
        <Hero />
        
        <div className="bg-white dark:bg-background-dark py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 gap-8 relative">
              
              {/* Left Social Sticky */}
              <div className="hidden lg:block lg:col-span-1">
                <SocialSidebar />
              </div>

              {/* Main Content */}
              <div className="lg:col-span-7">
                <BlogPost />
              </div>

              {/* Right Sidebar Form */}
              <div className="lg:col-span-4 space-y-6">
                <Sidebar />
              </div>
              
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Floating Call Button */}
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