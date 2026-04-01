import { NextRequest, NextResponse } from 'next/server';
import { preview } from '@/lib/preview';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel Cron sends this header)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await preview.publishScheduledContent();

    return NextResponse.json({
      success: true,
      published: result.published,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Scheduled publish error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
