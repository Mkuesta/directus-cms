'use client';

import { useEffect, useState } from 'react';

interface Subscriber {
  id: number;
  email: string;
  name?: string;
  status: 'pending' | 'active' | 'unsubscribed';
  source?: string;
  date_created?: string;
  date_confirmed?: string;
}

export function SubscribersList() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/admin/api/newsletter/subscribers')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load subscribers');
        return r.json();
      })
      .then(setSubscribers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading subscribers...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    unsubscribed: 'bg-gray-100 text-gray-600',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Newsletter Subscribers</h1>

      <div className="flex gap-4 mb-4 text-sm text-gray-500">
        <span>Total: {subscribers.length}</span>
        <span>Active: {subscribers.filter((s) => s.status === 'active').length}</span>
        <span>Pending: {subscribers.filter((s) => s.status === 'pending').length}</span>
      </div>

      {subscribers.length === 0 ? (
        <p className="text-gray-500">No subscribers yet.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Source</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Subscribed</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Confirmed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{sub.email}</td>
                  <td className="px-4 py-3 text-gray-500">{sub.name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[sub.status] ?? ''}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{sub.source || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {sub.date_created ? new Date(sub.date_created).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {sub.date_confirmed ? new Date(sub.date_confirmed).toLocaleDateString() : '—'}
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
