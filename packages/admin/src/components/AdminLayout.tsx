'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface AdminLayoutProps {
  children: ReactNode;
  siteName?: string;
  hasProducts?: boolean;
}

const NAV_ITEMS = [
  { href: '/admin/articles', label: 'Articles' },
  { href: '/admin/settings', label: 'Settings' },
];

const PRODUCT_NAV = { href: '/admin/products', label: 'Products' };

export function AdminLayout({ children, siteName = 'Admin', hasProducts = false }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/admin/api/auth/check')
      .then((r) => {
        if (!r.ok) throw new Error();
        setAuthed(true);
      })
      .catch(() => {
        setAuthed(false);
        router.push('/admin/login');
      });
  }, [router]);

  async function handleLogout() {
    await fetch('/admin/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!authed) return null;

  const nav = hasProducts ? [...NAV_ITEMS, PRODUCT_NAV] : NAV_ITEMS;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Link href="/admin" className="text-lg font-bold text-gray-900">
            {siteName}
          </Link>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md text-left transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
