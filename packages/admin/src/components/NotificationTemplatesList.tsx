'use client';

import { useEffect, useState } from 'react';

interface NotificationTemplate {
  id: number;
  slug: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
  status: 'active' | 'draft';
}

export function NotificationTemplatesList() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/admin/api/notification-templates')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load notification templates');
        return r.json();
      })
      .then(setTemplates)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading notification templates...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const typeColors: Record<string, string> = {
    success: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    warning: 'bg-yellow-100 text-yellow-700',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    draft: 'bg-gray-100 text-gray-600',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Notification Templates</h1>

      {templates.length === 0 ? (
        <p className="text-gray-500">No notification templates found.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Message</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Duration</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {templates.map((tmpl) => (
                <tr key={tmpl.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{tmpl.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[tmpl.type] ?? ''}`}>
                      {tmpl.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{tmpl.title || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{tmpl.message}</td>
                  <td className="px-4 py-3 text-gray-500">{tmpl.duration ? `${tmpl.duration}ms` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[tmpl.status] ?? ''}`}>
                      {tmpl.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
