import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { zip, radiusMiles } = body;

    if (!zip || !radiusMiles) {
      return NextResponse.json({ error: 'zip and radiusMiles are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .rpc('get_zip_codes_in_radius', {
        center_zip: zip,
        radius_miles: radiusMiles,
      });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const zipCodes = data?.map((row: { zip: string }) => row.zip) || [];

    return NextResponse.json({
      centerZip: zip,
      radiusMiles,
      zipCodes,
      count: zipCodes.length,
    });
  } catch (error) {
    console.error('Radius search API error:', error);
    return NextResponse.json({ error: 'Failed to search radius' }, { status: 500 });
  }
}
