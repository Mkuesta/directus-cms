import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TopBar } from './components/TopBar';
import { Hero } from './components/Hero';
import { FilterBar } from './components/FilterBar';
import { FeaturedPost } from './components/FeaturedPost';
import { ArticleGrid } from './components/ArticleGrid';
import { Sidebar } from './components/Sidebar';
import { Pagination } from './components/Pagination';
import { Footer } from './components/Footer';
import { FloatingAction } from './components/FloatingAction';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <TopBar />
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      
      <main className="flex-grow">
        <Hero />
        <FilterBar />
        
        <section className="py-12 bg-gray-50 dark:bg-background-dark min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <FeaturedPost />
            
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mt-12">
              <div className="lg:w-3/4">
                <ArticleGrid />
                <Pagination />
              </div>
              
              <div className="lg:w-1/4">
                <Sidebar />
              </div>
            </div>
            
          </div>
        </section>
      </main>

      <Footer />
      <FloatingAction />
    </div>
  );
};

export default App;