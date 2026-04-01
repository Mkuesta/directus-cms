import React, { useState } from 'react';
import { Moon, Sun, Menu, ArrowRight, PlusSquare, X } from 'lucide-react';

interface NavbarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isDarkMode, toggleTheme }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <PlusSquare className="text-primary w-8 h-8 md:w-10 md:h-10" strokeWidth={2.5} />
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
                className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
              >
                {item}
              </a>
            ))}
            
            <button className="bg-secondary hover:bg-green-600 text-white px-5 py-2.5 rounded-full font-semibold transition shadow-md hover:shadow-lg flex items-center gap-2">
              Get A Quote <ArrowRight size={16} />
            </button>
            
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? (
                <Sun className="text-yellow-400 w-5 h-5" />
              ) : (
                <Moon className="text-gray-500 w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
             <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {isDarkMode ? <Sun className="text-yellow-400 w-5 h-5" /> : <Moon className="text-gray-500 w-5 h-5" />}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-gray-900 dark:text-gray-300 focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-surface-dark border-t dark:border-gray-700 shadow-lg absolute w-full left-0 px-4 py-4 flex flex-col space-y-4">
          {['Solutions', 'Data', 'Resources', 'Company'].map((item) => (
            <a 
              key={item}
              href="#" 
              className="text-gray-600 dark:text-gray-300 hover:text-primary block py-2 text-lg font-medium"
            >
              {item}
            </a>
          ))}
          <button className="w-full bg-secondary hover:bg-green-600 text-white px-5 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
            Get A Quote <ArrowRight size={16} />
          </button>
        </div>
      )}
    </nav>
  );
};