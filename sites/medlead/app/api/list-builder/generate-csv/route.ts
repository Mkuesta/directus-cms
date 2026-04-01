import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import * as XLSX from 'xlsx';

interface FilterConfig {
  specialties: string[];
  states: string[];
  locations: string[];
  radiusSearch: { zip: string; radiusMiles: number } | null;
  providerTypes: string[];
  facilityTypes: string[];
  practiceSizes: string[];
  dataRequirements: {
    emailVerified: boolean;
    phoneVerified: boolean;
    npiVerified: boolean;
  };
}

function generateFilename(filterConfig: FilterConfig, leadCount: number): string {
  const parts: string[] = ['healthcare-leads'];
  if (filterConfig.specialties?.length > 0) {
    parts.push(filterConfig.specialties.slice(0, 2).join('-'));
  }
  if (filterConfig.states?.length > 0) {
    parts.push(filterConfig.states.slice(0, 2).join('-'));
  }
  if (filterConfig.radiusSearch?.zip) {
    parts.push(`zip${filterConfig.radiusSearch.zip}-${filterConfig.radiusSearch.radiusMiles}mi`);
  }
  parts.push(`${leadCount}leads`);
  return parts.join('-').toLowerCase().replace(/[^a-z0-9-]/g, '');
}

function escapeCSV(value: string): string {
  if (!value) return '';
  if (value.includes('"') || value.includes(',') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function generateCSV(providers: any[]): string {
  const headers = [
    'NPI','First Name','Last Name','Credential','Sex',
    'Specialty','Organization',
    'Practice Address','Practice City','Practice State','Practice Zip',
    'Practice Phone','Practice Fax',
    'Mailing Address','Mailing City','Mailing State','Mailing Zip',
    'Email',
  ];
  const rows = providers.map((p) => [
    escapeCSV(p.npi || ''),
    escapeCSV(p.first_name || ''),
    escapeCSV(p.last_name || ''),
    escapeCSV(p.credential || ''),
    escapeCSV(p.sex || ''),
    escapeCSV(p.primary_taxonomy_desc || ''),
    escapeCSV(p.org_name || ''),
    escapeCSV(p.practice_address1 || ''),
    escapeCSV(p.practice_city || ''),
    escapeCSV(p.practice_state || ''),
    escapeCSV(p.practice_zip || ''),
    escapeCSV(p.practice_phone || ''),
    escapeCSV(p.practice_fax || ''),
    escapeCSV(p.mailing_address1 || ''),
    escapeCSV(p.mailing_city || ''),
    escapeCSV(p.mailing_state || ''),
    escapeCSV(p.mailing_zip || ''),
    escapeCSV(p.email || ''),
  ]);
  const bom = '\uFEFF';
  return bom + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
}

function generateXLS(providers: any[]): Buffer {
  const headers = [
    'NPI','First Name','Last Name','Credential','Sex',
    'Specialty','Organization',
    'Practice Address','Practice City','Practice State','Practice Zip',
    'Practice Phone','Practice Fax',
    'Mailing Address','Mailing City','Mailing State','Mailing Zip',
    'Email',
  ];
  const rows = providers.map((p) => [
    p.npi || '', p.first_name || '', p.last_name || '',
    p.credential || '', p.sex || '',
    p.primary_taxonomy_desc || '', p.org_name || '',
    p.practice_address1 || '', p.practice_city || '', p.practice_state || '', p.practice_zip || '',
    p.practice_phone || '', p.practice_fax || '',
    p.mailing_address1 || '', p.mailing_city || '', p.mailing_state || '', p.mailing_zip || '',
    p.email || '',
  ]);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = headers.map(() => ({ wch: 20 }));
  XLSX.utils.book_append_sheet(wb, ws, 'Healthcare Leads');
  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { listOrderId, filterConfig }: { listOrderId: string; filterConfig: FilterConfig } = body;

    if (!listOrderId || !filterConfig) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(listOrderId)) {
      return NextResponse.json({ error: 'Invalid listOrderId format' }, { status: 400 });
    }

    const { data: listOrder, error: orderError } = await supabaseAdmin
      .from('list_orders')
      .select('*')
      .eq('id', listOrderId)
      .single();

    if (orderError || !listOrder) {
      return NextResponse.json({ error: 'List order not found' }, { status: 404 });
    }

    if (listOrder.status === 'completed') {
      return NextResponse.json({
        success: true,
        csvFilePath: listOrder.csv_file_path,
        xlsFilePath: listOrder.xls_file_path,
        message: 'Files already generated',
      });
    }

    await supabaseAdmin
      .from('list_orders')
      .update({ status: 'processing' })
      .eq('id', listOrderId);

    let query = supabaseAdmin
      .from('providers')
      .select('*');

    if (filterConfig.specialties?.length > 0) query = query.in('primary_taxonomy_desc', filterConfig.specialties);
    if (filterConfig.states?.length > 0) query = query.in('practice_state', filterConfig.states);
    if (filterConfig.radiusSearch?.zip && filterConfig.radiusSearch.radiusMiles > 0) {
      const { data: nearbyZips } = await supabaseAdmin
        .rpc('get_zip_codes_in_radius', {
          center_zip: filterConfig.radiusSearch.zip,
          radius_miles: filterConfig.radiusSearch.radiusMiles,
        });
      if (nearbyZips?.length > 0) {
        query = query.in('practice_zip', nearbyZips.map((r: { zip: string }) => r.zip));
      }
    }
    if (filterConfig.locations?.length > 0) {
      const cities: string[] = [];
      const zips: string[] = [];
      filterConfig.locations.forEach((loc) => {
        if (loc.startsWith('city:')) {
          const city = loc.replace('city:', '').replace(/[^a-zA-Z\s\-'.]/g, '');
          if (city.length > 0 && city.length <= 100) cities.push(city);
        } else if (loc.startsWith('zip:')) {
          const zip = loc.replace('zip:', '').replace(/[^0-9]/g, '');
          if (zip.length === 5) zips.push(zip);
        }
      });
      if (cities.length > 0 && zips.length > 0) {
        query = query.or(`practice_city.in.(${cities.map(c => `"${c}"`).join(',')}),practice_zip.in.(${zips.join(',')})`);
      } else if (cities.length > 0) {
        query = query.in('practice_city', cities);
      } else if (zips.length > 0) {
        query = query.in('practice_zip', zips);
      }
    }
    // providerTypes, facilityTypes, practiceSizes not in NPI schema — skip
    if (filterConfig.dataRequirements) {
      if (filterConfig.dataRequirements.emailVerified) query = query.not('email', 'is', null);
      if (filterConfig.dataRequirements.npiVerified) query = query.not('npi', 'is', null);
    }

    const { data: providers, error: queryError } = await query;
    if (queryError) {
      await supabaseAdmin
        .from('list_orders')
        .update({ status: 'failed', error_message: 'Failed to fetch provider data' })
        .eq('id', listOrderId);
      return NextResponse.json({ error: 'Failed to fetch provider data' }, { status: 500 });
    }

    const csvContent = generateCSV(providers || []);
    const xlsContent = generateXLS(providers || []);

    const leadCount = providers?.length || 0;
    const baseFilename = generateFilename(filterConfig, leadCount);
    const timestamp = Date.now();

    const csvPath = `list-builder/${listOrderId}/${baseFilename}-${timestamp}.csv`;
    const xlsPath = `list-builder/${listOrderId}/${baseFilename}-${timestamp}.xlsx`;

    const { error: csvUploadError } = await supabaseAdmin.storage
      .from('downloads')
      .upload(csvPath, csvContent, { contentType: 'text/csv; charset=utf-8', upsert: true });

    if (csvUploadError) {
      await supabaseAdmin
        .from('list_orders')
        .update({ status: 'failed', error_message: 'Failed to upload CSV file' })
        .eq('id', listOrderId);
      return NextResponse.json({ error: 'Failed to upload CSV file' }, { status: 500 });
    }

    const { error: xlsUploadError } = await supabaseAdmin.storage
      .from('downloads')
      .upload(xlsPath, xlsContent, {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        upsert: true,
      });

    await supabaseAdmin
      .from('list_orders')
      .update({
        status: 'completed',
        csv_file_path: csvPath,
        xls_file_path: xlsUploadError ? null : xlsPath,
        csv_display_name: `${baseFilename}.csv`,
        xls_display_name: xlsUploadError ? null : `${baseFilename}.xlsx`,
      })
      .eq('id', listOrderId);

    return NextResponse.json({
      success: true,
      csvFilePath: csvPath,
      xlsFilePath: xlsUploadError ? null : xlsPath,
      leadCount,
    });
  } catch (error) {
    console.error('Generate CSV API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
