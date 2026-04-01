import React, { useState } from 'react';

interface NavbarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isDarkMode, toggleDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-primary text-4xl">local_hospital</span>
            <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">
              Medico<span className="text-secondary">Reach</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8 items-center font-medium">
            {['Solutions', 'Data', 'Resources', 'Company'].map((item) => (
              <a 
                key={item}
                href="#" 
                className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition"
              >
                {item}
              </a>
            ))}
            
            <button className="bg-secondary hover:bg-green-600 text-white px-5 py-2.5 rounded-full font-semibold transition shadow-md hover:shadow-lg flex items-center gap-2">
              Get A Quote 
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>

            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="Toggle Dark Mode"
            >
              <span className={`material-symbols-outlined ${isDarkMode ? 'text-yellow-400' : 'text-gray-500'}`}>
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500 hover:text-gray-900 focus:outline-none"
            >
              <span className="material-symbols-outlined text-3xl">menu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {['Solutions', 'Data', 'Resources', 'Company'].map((item) => (
              <a 
                key={item}
                href="#" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {item}
              </a>
            ))}
             <button 
                onClick={toggleDarkMode}
                className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary"
              >
                {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;