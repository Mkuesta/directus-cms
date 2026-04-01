import { NextResponse } from 'next/server';
import { sitemapClient } from '@/lib/sitemap';

export const revalidate = 3600;

export async function GET() {
  const xml = await sitemapClient.generateSitemapXml();
  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' },
  });
}
