'use client';

import { useState, useMemo } from 'react';
import { marked } from 'marked';

function sanitizePreviewHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  for (const tag of ['script', 'iframe', 'object', 'embed', 'form'] as const) {
    doc.querySelectorAll(tag).forEach((el) => el.remove());
  }
  for (const el of doc.querySelectorAll('*')) {
    for (const attr of [...el.attributes]) {
      if (attr.name.startsWith('on') || /^javascript:/i.test(attr.value)) {
        el.removeAttribute(attr.name);
      }
    }
  }
  return doc.body.innerHTML;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  rows?: number;
}

export function MarkdownEditor({ value, onChange, label, rows = 20 }: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  const html = useMemo(() => {
    if (!showPreview || !value) return '';
    const raw = marked.parse(value, { async: false }) as string;
    return sanitizePreviewHtml(raw);
  }, [value, showPreview]);

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}

      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setShowPreview(false)}
          className={`px-3 py-1 text-xs rounded-md ${!showPreview ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className={`px-3 py-1 text-xs rounded-md ${showPreview ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Preview
        </button>
      </div>

      {showPreview ? (
        <div
          className="w-full border border-gray-300 rounded-md p-4 bg-white prose prose-sm max-w-none overflow-auto"
          style={{ minHeight: `${rows * 1.5}rem` }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      )}
    </div>
  );
}
