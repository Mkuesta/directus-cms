import { MetadataRoute } from "next";
import { sitemapClient } from "@/lib/sitemap";
import { cms } from "@/lib/cms";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://medlead.io").trim();

  // Package generates: static pages + blog posts + product pages
  const sitemapEntries = await sitemapClient.generateSitemap();

  const packagePages: MetadataRoute.Sitemap = sitemapEntries.map((entry) => ({
    url: entry.url,
    lastModified: entry.lastModified ? new Date(entry.lastModified) : new Date(),
    changeFrequency: entry.changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
    priority: entry.priority,
  }));

  // Medlead-specific: data category pages (specialty hierarchy)
  const allCategories = await cms.getAllCategories().catch(() => []);

  const categoryPages: MetadataRoute.Sitemap = allCategories
    .filter((cat) => cat.parent)
    .map((cat) => {
      const parentSlug = typeof cat.parent === 'object' && cat.parent ? cat.parent.slug : '';
      return {
        url: `${baseUrl}/data/${parentSlug}/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      };
    })
    .filter((entry) => entry.url.indexOf('//') === entry.url.indexOf('://'));

  return [...packagePages, ...categoryPages];
}

export const revalidate = 3600;
