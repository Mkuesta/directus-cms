'use client';

import { Headphones } from 'lucide-react';
import Link from 'next/link';

export function HelpCard() {
  return (
    <div className="bg-primary rounded-xl p-5 text-white">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
          <Headphones className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg mb-1">Need Help?</h3>
        <p className="text-sm text-white/80 mb-4">
          Our team of experts can help you build the perfect list.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center px-4 py-2 bg-white text-primary text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
