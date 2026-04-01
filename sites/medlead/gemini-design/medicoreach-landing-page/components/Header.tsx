import React, { useState } from 'react';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top Bar - Hidden on mobile */}
      <div className="bg-primary text-white text-xs py-2 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex space-x-6">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">phone</span> 1-888-664-9690
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">email</span> sales@medicoreach.com
            </span>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-green-200 transition-colors">Resources</a>
            <div className="flex space-x-2">
              <span className="cursor-pointer hover:text-green-200">FB</span>
              <span className="cursor-pointer hover:text-green-200">LI</span>
              <span className="cursor-pointer hover:text-green-200">TW</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
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
                  className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
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
                <span className="material-symbols-outlined text-gray-500 dark:text-yellow-400">
                  {darkMode ? 'light_mode' : 'dark_mode'}
                </span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
               <button
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                onClick={toggleDarkMode}
              >
                <span className="material-symbols-outlined text-gray-500 dark:text-yellow-400">
                  {darkMode ? 'light_mode' : 'dark_mode'}
                </span>
              </button>
              <button
                className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="material-symbols-outlined text-3xl">menu</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-700 px-4 pt-2 pb-4 space-y-2 shadow-lg">
             {['Solutions', 'Data', 'Resources', 'Company'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {item}
                </a>
              ))}
               <button className="w-full mt-4 bg-secondary hover:bg-green-600 text-white px-5 py-3 rounded-md font-semibold transition shadow-md flex items-center justify-center gap-2">
                Get A Quote <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
          </div>
        )}
      </nav>
    </>
  );
};

export default Header;