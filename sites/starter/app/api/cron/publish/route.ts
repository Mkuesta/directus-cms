import { NextRequest, NextResponse } from 'next/server';
import { preview } from '@/lib/preview';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await preview.publishScheduledContent();
  return NextResponse.json({ success: true, ...result, timestamp: new Date().toISOString() });
}
