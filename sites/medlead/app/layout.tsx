import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "@mkuesta/notifications/components";
import { ThemeProvider } from "next-themes";
import ServerSiteHeader from "@/components/medicoreach/ServerSiteHeader";
import ServerSiteFooter from "@/components/medicoreach/ServerSiteFooter";
import FloatingCTA from "@/components/medicoreach/FloatingCTA";
import { CartProvider } from "@/contexts/CartContext";
import { AnalyticsHead, AnalyticsBody } from "@/components/medicoreach/AnalyticsScripts";
import { BannerDisplay } from "@/components/medicoreach/BannerDisplay";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL((process.env.NEXT_PUBLIC_BASE_URL || "https://medlead.io").trim()),
  title: {
    default: "MedLead - Healthcare Lead Generation",
    template: "%s | MedLead",
  },
  description: "Verified healthcare professional databases for targeted B2B marketing campaigns. Physicians, nurses, dentists, pharmacists, and executives.",
  authors: [{ name: "MedLead" }],
  creator: "MedLead",
  publisher: "MedLead",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "MedLead - Healthcare Lead Generation",
    description: "Verified healthcare professional databases for targeted B2B marketing campaigns.",
    siteName: "MedLead",
  },
  twitter: {
    card: "summary_large_image",
    title: "MedLead - Healthcare Lead Generation",
    description: "Verified healthcare professional databases for targeted B2B marketing campaigns.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        <Suspense fallback={null}>
          <AnalyticsHead />
        </Suspense>
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  name: 'MedLead',
                  url: 'https://medlead.io/',
                  contactPoint: {
                    '@type': 'ContactPoint',
                    telephone: '+1-888-664-9690',
                    contactType: 'sales',
                    email: 'sales@medlead.com',
                  },
                },
                {
                  '@type': 'WebSite',
                  name: 'MedLead',
                  url: 'https://medlead.io/',
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: 'https://medlead.io/search?q={search_term_string}',
                    'query-input': 'required name=search_term_string',
                  },
                },
              ],
            }),
          }}
        />
        <Suspense fallback={null}>
          <AnalyticsBody />
        </Suspense>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <CartProvider>
            <NotificationProvider>
              <div className="min-h-screen flex flex-col bg-white dark:bg-background-dark transition-colors duration-300">
                <Suspense fallback={null}>
                  <BannerDisplay />
                </Suspense>
                <Suspense fallback={null}>
                  <ServerSiteHeader />
                </Suspense>
                <main className="flex-1">{children}</main>
                <Suspense fallback={null}>
                  <ServerSiteFooter />
                </Suspense>
                <FloatingCTA />
              </div>
            </NotificationProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
