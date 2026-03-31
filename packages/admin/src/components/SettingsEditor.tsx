'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { ImageUpload } from './ImageUpload';

interface SettingsEditorProps {
  directusUrl?: string;
}

export function SettingsEditor({ directusUrl }: SettingsEditorProps) {
  const [settings, setSettings] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/admin/api/settings')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load settings');
        return r.json();
      })
      .then(setSettings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function updateField(field: string, value: any) {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/admin/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_name: settings.site_name,
          site_title: settings.site_title,
          site_description: settings.site_description,
          default_author_name: settings.default_author_name,
          default_author_title: settings.default_author_title,
          default_author_url: settings.default_author_url,
          default_author_twitter: settings.default_author_twitter,
          twitter_handle: settings.twitter_handle,
          linkedin_url: settings.linkedin_url,
          organization_description: settings.organization_description,
          theme_color: settings.theme_color,
          site_tagline: settings.site_tagline,
          default_language: settings.default_language,
          primary_color: settings.primary_color,
          secondary_color: settings.secondary_color,
          homepage_keywords: settings.homepage_keywords,
          default_meta_robots: settings.default_meta_robots,
          logo_initials: settings.logo_initials,
          contact_page_path: settings.contact_page_path,
          default_logo: fileIdOf(settings.default_logo),
          default_og_image: fileIdOf(settings.default_og_image),
          default_article_image: fileIdOf(settings.default_article_image),
          default_author_image: fileIdOf(settings.default_author_image),
          favicon: fileIdOf(settings.favicon),
          apple_touch_icon: fileIdOf(settings.apple_touch_icon),
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

  if (loading) return <p className="text-gray-500">Loading settings...</p>;
  if (error && !settings) return <p className="text-red-600">{error}</p>;
  if (!settings) return <p className="text-red-600">Settings not found</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Site Settings</h1>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Site Info */}
        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Site Info</h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Site Name" value={settings.site_name} onChange={(v) => updateField('site_name', v)} />
            <Field label="Site Title" value={settings.site_title} onChange={(v) => updateField('site_title', v)} />
          </div>
          <Field label="Site Description" value={settings.site_description} onChange={(v) => updateField('site_description', v)} multiline rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Site Tagline" value={settings.site_tagline} onChange={(v) => updateField('site_tagline', v)} />
            <Field label="Default Language" value={settings.default_language} onChange={(v) => updateField('default_language', v)} />
          </div>
          <Field label="Homepage Keywords" value={settings.homepage_keywords} onChange={(v) => updateField('homepage_keywords', v)} />
        </section>

        {/* Author Defaults */}
        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Default Author</h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Name" value={settings.default_author_name} onChange={(v) => updateField('default_author_name', v)} />
            <Field label="Title" value={settings.default_author_title} onChange={(v) => updateField('default_author_title', v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="URL" value={settings.default_author_url} onChange={(v) => updateField('default_author_url', v)} />
            <Field label="Twitter" value={settings.default_author_twitter} onChange={(v) => updateField('default_author_twitter', v)} />
          </div>
          <ImageUpload
            label="Author Image"
            value={fileIdOf(settings.default_author_image)}
            directusUrl={directusUrl}
            onChange={(id) => updateField('default_author_image', id)}
          />
        </section>

        {/* Social */}
        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Social & SEO</h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Twitter Handle" value={settings.twitter_handle} onChange={(v) => updateField('twitter_handle', v)} />
            <Field label="LinkedIn URL" value={settings.linkedin_url} onChange={(v) => updateField('linkedin_url', v)} />
          </div>
          <Field label="Organization Description" value={settings.organization_description} onChange={(v) => updateField('organization_description', v)} multiline rows={2} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Default Meta Robots" value={settings.default_meta_robots} onChange={(v) => updateField('default_meta_robots', v)} />
            <Field label="Contact Page Path" value={settings.contact_page_path} onChange={(v) => updateField('contact_page_path', v)} />
          </div>
        </section>

        {/* Branding */}
        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Branding</h2>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Theme Color" value={settings.theme_color} onChange={(v) => updateField('theme_color', v)} />
            <Field label="Primary Color" value={settings.primary_color} onChange={(v) => updateField('primary_color', v)} />
            <Field label="Secondary Color" value={settings.secondary_color} onChange={(v) => updateField('secondary_color', v)} />
          </div>
          <Field label="Logo Initials" value={settings.logo_initials} onChange={(v) => updateField('logo_initials', v)} />
        </section>

        {/* Images */}
        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Images</h2>

          <div className="grid grid-cols-2 gap-6">
            <ImageUpload
              label="Logo"
              value={fileIdOf(settings.default_logo)}
              directusUrl={directusUrl}
              onChange={(id) => updateField('default_logo', id)}
            />
            <ImageUpload
              label="OG Image"
              value={fileIdOf(settings.default_og_image)}
              directusUrl={directusUrl}
              onChange={(id) => updateField('default_og_image', id)}
            />
            <ImageUpload
              label="Default Article Image"
              value={fileIdOf(settings.default_article_image)}
              directusUrl={directusUrl}
              onChange={(id) => updateField('default_article_image', id)}
            />
            <ImageUpload
              label="Favicon"
              value={fileIdOf(settings.favicon)}
              directusUrl={directusUrl}
              onChange={(id) => updateField('favicon', id)}
            />
            <ImageUpload
              label="Apple Touch Icon"
              value={fileIdOf(settings.apple_touch_icon)}
              directusUrl={directusUrl}
              onChange={(id) => updateField('apple_touch_icon', id)}
            />
          </div>
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

// ── Helpers ──────────────────────────────────────────────────────────────────

function fileIdOf(value: any): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value.id) return value.id;
  return undefined;
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
  rows = 1,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
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
        <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </div>
  );
}
