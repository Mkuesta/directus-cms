'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronDown, Mail } from 'lucide-react';
import { TagCloud } from '@mkuesta/tags/components';

interface SidebarProps {
  tags?: { tag: string; count: number }[];
}

const Sidebar: React.FC<SidebarProps> = ({ tags }) => {
  const [nlEmail, setNlEmail] = React.useState('');
  const [nlStatus, setNlStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlEmail.trim()) return;
    setNlStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'subscribe', email: nlEmail, _hp_field: '' }),
      });
      setNlStatus(res.ok ? 'success' : 'error');
      if (res.ok) setNlEmail('');
    } catch {
      setNlStatus('error');
    }
  };

  return (
    <div className="space-y-6 sticky top-[8rem]">

      {/* Quote Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-primary p-5 text-center">
          <h3 className="text-xl font-bold text-white mb-1">Get a Free Quote</h3>
          <p className="text-teal-100 text-xs">Build your perfect medical list today.</p>
        </div>
        <div className="p-5">
          <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="sr-only">Full Name</label>
              <input type="text" placeholder="Full Name" className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition text-sm dark:text-white" />
            </div>
            <div>
              <label className="sr-only">Business Email</label>
              <input type="email" placeholder="Business Email" className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition text-sm dark:text-white" />
            </div>
            <div>
              <label className="sr-only">Phone Number</label>
              <input type="tel" placeholder="Phone" className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition text-sm dark:text-white" />
            </div>
            <div className="relative">
              <select className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition text-sm text-gray-500 dark:text-gray-400 appearance-none cursor-pointer">
                <option>Select Specialty</option>
                <option>Physicians</option>
                <option>Nurses</option>
                <option>Dentists</option>
              </select>
              <ChevronDown className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" size={16} />
            </div>
            <button className="w-full bg-secondary hover:bg-green-600 text-white font-bold py-2.5 px-4 rounded-md shadow-md hover:shadow-lg transition transform active:scale-95 duration-200 text-sm mt-2">
              Request Quote
            </button>
          </form>
          <p className="text-[10px] text-center text-gray-400 mt-3">No credit card required. Privacy guaranteed.</p>
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 border border-teal-100 dark:border-teal-900 mt-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="bg-white p-2 rounded-full shadow-sm text-primary">
            <Mail size={20} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Weekly Insights</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Join 15k+ marketers.</p>
          </div>
        </div>
        {nlStatus === 'success' ? (
          <p className="text-sm text-green-600 dark:text-green-400">Check your email to confirm!</p>
        ) : (
          <form onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={nlEmail}
              onChange={(e) => setNlEmail(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:border-primary dark:bg-slate-800 dark:text-white mb-2"
            />
            <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
              <input type="text" name="_hp_field" tabIndex={-1} autoComplete="off" />
            </div>
            <button
              type="submit"
              disabled={nlStatus === 'loading'}
              className="w-full text-xs font-semibold text-primary hover:text-teal-700 border border-primary/20 hover:bg-primary/5 rounded-md py-2 transition disabled:opacity-50"
            >
              {nlStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
            {nlStatus === 'error' && <p className="text-xs text-red-500 mt-1">Something went wrong. Try again.</p>}
          </form>
        )}
      </div>

      {/* Tags */}
      <div className="mt-8">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Trending Topics</h4>
        {tags && tags.length > 0 ? (
          <TagCloud tags={tags.slice(0, 8)} baseUrl="/resources/tags" className="flex flex-wrap gap-2" minFontSize={0.75} maxFontSize={1.0} />
        ) : (
          <div className="flex flex-wrap gap-2">
            {['#LeadGeneration', '#EmailMarketing', '#DataHygiene', '#B2BHealthcare', '#HIPAA'].map(tag => (
              <span key={tag} className="text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded hover:border-primary hover:text-primary transition">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
