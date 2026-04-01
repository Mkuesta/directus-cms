import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming','District of Columbia',
];

const STATE_ABBR: Record<string, string> = {
  'Alabama':'AL','Alaska':'AK','Arizona':'AZ','Arkansas':'AR','California':'CA',
  'Colorado':'CO','Connecticut':'CT','Delaware':'DE','Florida':'FL','Georgia':'GA',
  'Hawaii':'HI','Idaho':'ID','Illinois':'IL','Indiana':'IN','Iowa':'IA',
  'Kansas':'KS','Kentucky':'KY','Louisiana':'LA','Maine':'ME','Maryland':'MD',
  'Massachusetts':'MA','Michigan':'MI','Minnesota':'MN','Mississippi':'MS',
  'Missouri':'MO','Montana':'MT','Nebraska':'NE','Nevada':'NV','New Hampshire':'NH',
  'New Jersey':'NJ','New Mexico':'NM','New York':'NY','North Carolina':'NC',
  'North Dakota':'ND','Ohio':'OH','Oklahoma':'OK','Oregon':'OR','Pennsylvania':'PA',
  'Rhode Island':'RI','South Carolina':'SC','South Dakota':'SD','Tennessee':'TN',
  'Texas':'TX','Utah':'UT','Vermont':'VT','Virginia':'VA','Washington':'WA',
  'West Virginia':'WV','Wisconsin':'WI','Wyoming':'WY','District of Columbia':'DC',
};

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from('providers')
      .select('practice_state')
      .not('practice_state', 'is', null);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // NPI data uses state abbreviations (TX, CA, NY)
    const ABBR_TO_NAME: Record<string, string> = {};
    Object.entries(STATE_ABBR).forEach(([name, abbr]) => { ABBR_TO_NAME[abbr] = name; });

    const stateCounts: Record<string, number> = {};
    data?.forEach((row: any) => {
      const abbr = row.practice_state;
      if (abbr) {
        const name = ABBR_TO_NAME[abbr] || abbr;
        stateCounts[name] = (stateCounts[name] || 0) + 1;
      }
    });

    const states = US_STATES.map((name) => ({
      id: STATE_ABBR[name] || name.toLowerCase().replace(/\s+/g, '-'),
      name,
      abbr: STATE_ABBR[name] || '',
      count: stateCounts[name] || 0,
    }));

    return NextResponse.json({ states });
  } catch (error) {
    console.error('States API error:', error);
    return NextResponse.json({ error: 'Failed to fetch states' }, { status: 500 });
  }
}
