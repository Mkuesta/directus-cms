import React from 'react';

interface GtmScriptProps {
  gtmId: string;
}

/**
 * GTM script tag for the <head>. Use in app/layout.tsx.
 *
 * Usage:
 *   <head><GtmScript gtmId="GTM-XXXXXX" /></head>
 */
const TRACKING_ID_RE = /^[A-Z0-9-]+$/;

export function GtmScript({ gtmId }: GtmScriptProps) {
  if (!gtmId || !TRACKING_ID_RE.test(gtmId)) return null;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`,
      }}
    />
  );
}
