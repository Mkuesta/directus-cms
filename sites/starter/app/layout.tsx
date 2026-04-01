import type { Metadata } from 'next';
import { SITE_NAME, BASE_URL } from '@/lib/directus/config';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: `Welcome to ${SITE_NAME}.`,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* TODO: add header, footer, providers */}
        <main>{children}</main>
      </body>
    </html>
  );
}
