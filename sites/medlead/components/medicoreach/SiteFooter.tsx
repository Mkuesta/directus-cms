'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface FooterNavItem {
  label: string;
  href: string;
}

interface SiteFooterProps {
  quickLinks?: FooterNavItem[];
  resourceLinks?: FooterNavItem[];
}

const SiteFooter: React.FC<SiteFooterProps> = ({ quickLinks: externalQuickLinks, resourceLinks: externalResourceLinks }) => {
  const [nlName, setNlName] = useState('');
  const [nlEmail, setNlEmail] = useState('');
  const [nlStatus, setNlStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlEmail.trim()) return;
    setNlStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'subscribe', email: nlEmail, name: nlName, _hp_field: '' }),
      });
      setNlStatus(res.ok ? 'success' : 'error');
      if (res.ok) { setNlEmail(''); setNlName(''); }
    } catch {
      setNlStatus('error');
    }
  };
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8 border-t-4 border-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-secondary text-3xl">local_hospital</span>
              <span className="font-bold text-xl">Med<span className="text-secondary">lead</span></span>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              1640 Highland Falls Dr, Ste #302,<br />
              Leander, Texas 78641<br />
              USA
            </p>
            <div className="flex space-x-4 text-gray-400">
              <a href="#" className="no-underline hover:text-secondary transition-colors"><span className="material-symbols-outlined text-lg">social_leaderboard</span></a>
              <a href="#" className="no-underline hover:text-secondary transition-colors">X</a>
              <a href="#" className="no-underline hover:text-secondary transition-colors"><span className="material-symbols-outlined text-lg">ondemand_video</span></a>
              <a href="#" className="no-underline hover:text-secondary transition-colors">in</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              {(externalQuickLinks && externalQuickLinks.length > 0 ? externalQuickLinks : [
                { label: 'Home', href: '/' },
                { label: 'Solutions', href: '/solutions' },
                { label: 'About Us', href: '/a-propos' },
                { label: 'Email Lists', href: '/email-lists' },
                { label: 'Blog', href: '/blog' },
                { label: 'Contact Us', href: '/contact' },
              ]).map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="no-underline text-gray-400 hover:text-secondary transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Resources</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              {(externalResourceLinks && externalResourceLinks.length > 0
                ? externalResourceLinks.map(link => (
                    <li key={link.label}><Link href={link.href} className="no-underline text-gray-400 hover:text-secondary transition-colors">{link.label}</Link></li>
                  ))
                : ['Healthcare Databases', 'Case Studies', 'Glossary', 'FAQ', 'Code Lookup Tools'].map(link => (
                    <li key={link}><a href="#" className="no-underline text-gray-400 hover:text-secondary transition-colors">{link}</a></li>
                  ))
              )}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Newsletter</h4>
            {nlStatus === 'success' ? (
              <p className="text-sm text-green-400">Check your email to confirm your subscription!</p>
            ) : (
              <form className="space-y-3" onSubmit={handleNewsletterSubmit}>
                <div>
                  <label className="sr-only">Name</label>
                  <input type="text" value={nlName} onChange={(e) => setNlName(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded focus:outline-none focus:border-secondary text-sm text-white placeholder-gray-500" placeholder="Name" />
                </div>
                <div>
                  <label className="sr-only">Email address</label>
                  <input type="email" value={nlEmail} onChange={(e) => setNlEmail(e.target.value)} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded focus:outline-none focus:border-secondary text-sm text-white placeholder-gray-500" placeholder="Email address" />
                </div>
                <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
                  <input type="text" name="_hp_field" tabIndex={-1} autoComplete="off" />
                </div>
                <button type="submit" disabled={nlStatus === 'loading'} className="w-full bg-secondary hover:bg-green-600 text-white font-bold py-2 rounded transition text-sm disabled:opacity-50">
                  {nlStatus === 'loading' ? 'Signing up...' : 'Sign Up'}
                </button>
                {nlStatus === 'error' && <p className="text-xs text-red-400">Something went wrong. Try again.</p>}
              </form>
            )}
            <div className="mt-6 flex gap-2">
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center p-1">
                <span className="material-symbols-outlined text-blue-500">security</span>
              </div>
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center p-1">
                <span className="material-symbols-outlined text-teal-500">verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Medlead. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 mt-4 md:mt-0 items-center">
            <Link href="/privacy-policy" className="no-underline text-gray-500 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="no-underline text-gray-500 hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/impressum" className="no-underline text-gray-500 hover:text-white transition-colors">Impressum</Link>
            <span className="text-slate-700">|</span>
            <Link href="/contact" className="no-underline flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-sm">chat</span> Send us a message
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
