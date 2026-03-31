import React from 'react';

interface GtmNoScriptProps {
  gtmId: string;
}

/**
 * GTM noscript iframe for the <body>. Use at the top of app/layout.tsx body.
 *
 * Usage:
 *   <body><GtmNoScript gtmId="GTM-XXXXXX" />...</body>
 */
export function GtmNoScript({ gtmId }: GtmNoScriptProps) {
  if (!gtmId) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  );
}
