'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { MarkdownEditor } from './MarkdownEditor';
import { ImageUpload } from './ImageUpload';

interface ProductEditorProps {
  productId: string;
  directusUrl?: string;
  currency?: string;
}

export function ProductEditor({ productId, directusUrl, currency = 'EUR' }: ProductEditorProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Record<string, any> | null>(null);
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`/admin/api/products/${productId}`).then((r) => {
        if (!r.ok) throw new Error('Product not found');
        return r.json();
      }),
      fetch('/admin/api/product-categories')
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
    ])
      .then(([prod, cats]) => {
        setProduct(prod);
        setCategories(cats);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [productId]);

  function updateField(field: string, value: any) {
    setProduct((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!product) return;

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch(`/admin/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: product.title,
          slug: product.slug,
          description: product.description,
          short_description: product.short_description,
          price: product.price,
          compare_at_price: product.compare_at_price,
          status: product.status,
          featured: product.featured,
          sku: product.sku,
          publisher: product.publisher,
          file_format: product.file_format,
          file_size: product.file_size,
          file_url: product.file_url,
          category: typeof product.category === 'object' ? product.category?.id : product.category,
          image: typeof product.image === 'object' ? product.image?.id : product.image,
          seo_article: product.seo_article,
          seo_article_title: product.seo_article_title,
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

  if (loading) return <p className="text-gray-500">Loading product...</p>;
  if (error && !product) return <p className="text-red-600">{error}</p>;
  if (!product) return <p className="text-red-600">Product not found</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Back to list
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic fields */}
        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Product Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Title" value={product.title} onChange={(v) => updateField('title', v)} />
            <Field label="Slug" value={product.slug} onChange={(v) => updateField('slug', v)} />
          </div>

          <Field label="Short Description" value={product.short_description} onChange={(v) => updateField('short_description', v)} multiline rows={2} />
          <Field label="Description" value={product.description} onChange={(v) => updateField('description', v)} multiline rows={4} />

          <div className="grid grid-cols-4 gap-4">
            <Field label={`Price (${currency})`} value={product.price?.toString()} onChange={(v) => updateField('price', parseFloat(v) || 0)} type="number" />
            <Field label="Compare At" value={product.compare_at_price?.toString()} onChange={(v) => updateField('compare_at_price', parseFloat(v) || null)} type="number" />
            <SelectField
              label="Status"
              value={product.status}
              onChange={(v) => updateField('status', v)}
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' },
              ]}
            />
            <SelectField
              label="Featured"
              value={product.featured ? 'true' : 'false'}
              onChange={(v) => updateField('featured', v === 'true')}
              options={[
                { value: 'false', label: 'No' },
                { value: 'true', label: 'Yes' },
              ]}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="SKU" value={product.sku} onChange={(v) => updateField('sku', v)} />
            <Field label="Publisher" value={product.publisher} onChange={(v) => updateField('publisher', v)} />
            {categories.length > 0 && (
              <SelectField
                label="Category"
                value={String(typeof product.category === 'object' ? product.category?.id : product.category || '')}
                onChange={(v) => updateField('category', v ? parseInt(v) : null)}
                options={[
                  { value: '', label: '— None —' },
                  ...categories.map((c) => ({ value: String(c.id), label: c.name })),
                ]}
              />
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="File Format" value={product.file_format} onChange={(v) => updateField('file_format', v)} />
            <Field label="File Size" value={product.file_size} onChange={(v) => updateField('file_size', v)} />
            <Field label="File URL" value={product.file_url} onChange={(v) => updateField('file_url', v)} />
          </div>

          <ImageUpload
            label="Product Image"
            value={typeof product.image === 'object' ? product.image?.id : product.image}
            directusUrl={directusUrl}
            onChange={(id) => updateField('image', id)}
          />
        </section>

        {/* SEO Article */}
        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">SEO Article</h2>
          <Field label="Article Title" value={product.seo_article_title} onChange={(v) => updateField('seo_article_title', v)} />
          <MarkdownEditor
            label="Article Content"
            value={product.seo_article || ''}
            onChange={(v) => updateField('seo_article', v)}
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
