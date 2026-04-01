'use client';

import React from 'react';
import Link from 'next/link';

const FloatingCTA: React.FC = () => {
  return (
    <Link
      href="/contact"
      className="no-underline fixed bottom-6 right-6 z-50 bg-secondary hover:bg-green-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce"
      aria-label="Contact us"
    >
      <span className="material-symbols-outlined text-2xl">call</span>
    </Link>
  );
};

export default FloatingCTA;
