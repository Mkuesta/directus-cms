import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name') || 'Medlead';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            maxWidth: '900px',
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: '#94a3b8',
              marginBottom: '24px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Medlead
          </div>
          <div
            style={{
              fontSize: name.length > 60 ? 40 : 52,
              fontWeight: 700,
              color: '#f8fafc',
              lineHeight: 1.2,
              textAlign: 'center',
            }}
          >
            {name}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
