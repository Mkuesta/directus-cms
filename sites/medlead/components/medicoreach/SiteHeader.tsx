'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { CartDrawer } from '@/components/cart/CartDrawer';

interface NavItem {
  label: string;
  href: string;
}

interface SiteHeaderProps {
  navItems?: NavItem[];
}

const SiteHeader: React.FC<SiteHeaderProps> = ({ navItems: externalNavItems }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const toggleDarkMode = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  const defaultNavItems: NavItem[] = [
    { label: 'Solutions', href: '/solutions' },
    { label: 'Data', href: '/data' },
    { label: 'List Builder', href: '/list-builder' },
    { label: 'Resources', href: '/resources' },
    { label: 'Company', href: '/a-propos' },
  ];
  const navItems = externalNavItems && externalNavItems.length > 0 ? externalNavItems : defaultNavItems;

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
              <span className="material-symbols-outlined text-sm">email</span> sales@medlead.com
            </span>
          </div>
          <div className="flex space-x-4">
            <Link href="/resources" className="no-underline text-white hover:text-green-200 transition-colors">Resources</Link>
            <div className="flex space-x-2">
              <span className="cursor-pointer hover:text-green-200 transition-colors">FB</span>
              <span className="cursor-pointer hover:text-green-200 transition-colors">LI</span>
              <span className="cursor-pointer hover:text-green-200 transition-colors">TW</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="no-underline flex-shrink-0 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-4xl">local_hospital</span>
              <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">
                Med<span className="text-secondary">lead</span>
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8 items-center font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="no-underline text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/contact"
                className="no-underline bg-secondary hover:bg-green-600 text-white px-5 py-2.5 rounded-full font-semibold transition shadow-md hover:shadow-lg flex items-center gap-2"
              >
                Get A Quote <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
              <button
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search"
              >
                <span className="material-symbols-outlined text-gray-500 dark:text-gray-300">search</span>
              </button>
              <CartDrawer />
              <button
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                onClick={toggleDarkMode}
                aria-label="Toggle Dark Mode"
              >
                <span className="material-symbols-outlined text-gray-500 dark:text-yellow-400">
                  {isDarkMode ? 'light_mode' : 'dark_mode'}
                </span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <CartDrawer />
              <button
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                onClick={toggleDarkMode}
              >
                <span className="material-symbols-outlined text-gray-500 dark:text-yellow-400">
                  {isDarkMode ? 'light_mode' : 'dark_mode'}
                </span>
              </button>
              <button
                className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="material-symbols-outlined text-3xl">
                  {isMobileMenuOpen ? 'close' : 'menu'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-700 px-4 py-3 shadow-lg">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                autoFocus
              />
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-teal-700 transition text-sm font-medium">
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-700 px-4 pt-2 pb-4 space-y-2 shadow-lg">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="no-underline block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="no-underline w-full mt-4 bg-secondary hover:bg-green-600 text-white px-5 py-3 rounded-md font-semibold transition shadow-md flex items-center justify-center gap-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Get A Quote <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        )}
      </nav>
    </>
  );
};

export default SiteHeader;
