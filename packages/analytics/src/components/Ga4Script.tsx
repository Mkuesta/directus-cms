import React from 'react';

interface Ga4ScriptProps {
  ga4Id: string;
}

/**
 * GA4 script tags for the <head>. Use in app/layout.tsx.
 * Only needed if NOT using GTM (GTM handles GA4 internally).
 *
 * Usage:
 *   <head><Ga4Script ga4Id="G-XXXXXXXXXX" /></head>
 */
const TRACKING_ID_RE = /^[A-Z0-9-]+$/;

export function Ga4Script({ ga4Id }: Ga4ScriptProps) {
  if (!ga4Id || !TRACKING_ID_RE.test(ga4Id)) return null;

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}');`,
        }}
      />
    </>
  );
}
