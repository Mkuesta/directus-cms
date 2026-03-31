'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { MarkdownEditor } from './MarkdownEditor';
import { ImageUpload } from './ImageUpload';

interface ArticleEditorProps {
  articleId: string;
  directusUrl?: string;
}

export function ArticleEditor({ articleId, directusUrl }: ArticleEditorProps) {
  const router = useRouter();
  const [article, setArticle] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/admin/api/articles/${articleId}`)
      .then((r) => {
        if (!r.ok) throw new Error('Article not found');
        return r.json();
      })
      .then(setArticle)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [articleId]);

  function updateField(field: string, value: any) {
    setArticle((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!article) return;

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch(`/admin/api/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          author: article.author,
          status: article.status,
          published_date: article.published_date,
          seo_title: article.seo_title,
          seo_description: article.seo_description,
          seo_keywords: article.seo_keywords,
          meta_robots: article.meta_robots,
          canonical_url: article.canonical_url,
          og_title: article.og_title,
          og_description: article.og_description,
          og_image: article.og_image,
          twitter_title: article.twitter_title,
          twitter_description: article.twitter_description,
          featured_image: article.featured_image,
        }),
      });

      if (!res.ok) throw new Error('Save failed');
      setMessage('Saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-gray-500">Loading article...</p>;
  if (error && !article) return <p className="text-red-600">{error}</p>;
  if (!article) return <p className="text-red-600">Article not found</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Article</h1>
        <button
          type="button"
          onClick={() => router.push('/admin/articles')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Back to list
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic fields */}
        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Content</h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Title" value={article.title} onChange={(v) => updateField('title', v)} />
            <Field label="Slug" value={article.slug} onChange={(v) => updateField('slug', v)} />
          </div>

          <Field label="Excerpt" value={article.excerpt} onChange={(v) => updateField('excerpt', v)} multiline rows={3} />

          <MarkdownEditor
            label="Content"
            value={article.content || ''}
            onChange={(v) => updateField('content', v)}
          />

          <div className="grid grid-cols-3 gap-4">
            <Field label="Author" value={article.author} onChange={(v) => updateField('author', v)} />
            <SelectField
              label="Status"
              value={article.status}
              onChange={(v) => updateField('status', v)}
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
            <Field
              label="Published Date"
              value={article.published_date?.slice(0, 10)}
              onChange={(v) => updateField('published_date', v)}
              type="date"
            />
          </div>

          <ImageUpload
            label="Featured Image"
            value={typeof article.featured_image === 'object' ? article.featured_image?.id : article.featured_image}
            directusUrl={directusUrl}
            onChange={(id) => updateField('featured_image', id)}
          />
        </section>

        {/* SEO fields */}
        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">SEO</h2>

          <Field label="SEO Title" value={article.seo_title} onChange={(v) => updateField('seo_title', v)} />
          <Field label="SEO Description" value={article.seo_description} onChange={(v) => updateField('seo_description', v)} multiline rows={2} />
          <Field label="SEO Keywords" value={article.seo_keywords} onChange={(v) => updateField('seo_keywords', v)} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Meta Robots" value={article.meta_robots} onChange={(v) => updateField('meta_robots', v)} />
            <Field label="Canonical URL" value={article.canonical_url} onChange={(v) => updateField('canonical_url', v)} />
          </div>
        </section>

        {/* OG / Twitter fields */}
        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Social</h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="OG Title" value={article.og_title} onChange={(v) => updateField('og_title', v)} />
            <Field label="Twitter Title" value={article.twitter_title} onChange={(v) => updateField('twitter_title', v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="OG Description" value={article.og_description} onChange={(v) => updateField('og_description', v)} multiline rows={2} />
            <Field label="Twitter Description" value={article.twitter_description} onChange={(v) => updateField('twitter_description', v)} multiline rows={2} />
          </div>

          <ImageUpload
            label="OG Image"
            value={article.og_image}
            directusUrl={directusUrl}
            onChange={(id) => updateField('og_image', id)}
          />
        </section>

        {/* Save */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          {message && <p className="text-sm text-green-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </form>
    </div>
  );
}

// ── Reusable field components ─────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  type = 'text',
  multiline = false,
  rows = 1,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  type?: string;
  multiline?: boolean;
  rows?: number;
}) {
  const cls = 'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {multiline ? (
        <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={rows} className={cls} />
      ) : (
        <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
