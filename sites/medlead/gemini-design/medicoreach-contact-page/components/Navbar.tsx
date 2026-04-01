import React, { useState } from 'react';

interface NavbarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isDarkMode, toggleDarkMode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-primary text-4xl">local_hospital</span>
            <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">
              Medico<span className="text-secondary">Reach</span>
            </span>
          </div>
          
          {/* Desktop Menu */}
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
              Get A Quote <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
            <button
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              onClick={toggleDarkMode}
              aria-label="Toggle Dark Mode"
            >
              <span className={`material-symbols-outlined ${isDarkMode ? 'text-yellow-400' : 'text-gray-500'}`}>
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
             <button
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              onClick={toggleDarkMode}
            >
              <span className={`material-symbols-outlined ${isDarkMode ? 'text-yellow-400' : 'text-gray-500'}`}>
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <button
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="material-symbols-outlined text-3xl">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-700 transition-all duration-300 ease-in-out">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {['Solutions', 'Data', 'Resources', 'Company'].map((item) => (
              <a
                key={item}
                href="#"
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                {item}
              </a>
            ))}
            <div className="pt-4">
              <button className="w-full bg-secondary hover:bg-green-600 text-white px-5 py-3 rounded-lg font-semibold transition shadow-md flex items-center justify-center gap-2">
                Get A Quote <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;