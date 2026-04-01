import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const format = searchParams.get('format') || 'csv';

    if (!token) {
      return NextResponse.json({ error: 'Download token is required' }, { status: 400 });
    }

    // Find order by download token
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('download_token', token)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Invalid download token' }, { status: 404 });
    }

    // Check expiry
    if (order.download_expires_at && new Date(order.download_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Download link has expired' }, { status: 410 });
    }

    // Check download limit
    if (order.download_limit && order.download_count >= order.download_limit) {
      return NextResponse.json({ error: 'Download limit reached' }, { status: 429 });
    }

    // Get list orders for this order
    const { data: listOrders, error: listError } = await supabaseAdmin
      .from('list_orders')
      .select('*')
      .eq('order_id', order.id)
      .eq('status', 'completed');

    if (listError || !listOrders?.length) {
      return NextResponse.json(
        { error: 'No completed list orders found. Files may still be generating.' },
        { status: 404 }
      );
    }

    const listOrder = listOrders[0];
    const filePath = format === 'xlsx' ? listOrder.xls_file_path : listOrder.csv_file_path;

    if (!filePath) {
      return NextResponse.json(
        { error: `${format.toUpperCase()} file not available` },
        { status: 404 }
      );
    }

    // Generate signed URL
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from('downloads')
      .createSignedUrl(filePath, 3600);

    if (signedUrlError || !signedUrlData) {
      return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
    }

    // Increment download count
    await supabaseAdmin
      .from('orders')
      .update({ download_count: (order.download_count || 0) + 1 })
      .eq('id', order.id);

    const fileName = format === 'xlsx'
      ? listOrder.xls_display_name || 'healthcare-leads.xlsx'
      : listOrder.csv_display_name || 'healthcare-leads.csv';

    return NextResponse.json({
      downloadUrl: signedUrlData.signedUrl,
      fileName,
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
