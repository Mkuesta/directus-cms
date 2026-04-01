import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
const stripe = stripeKey ? new Stripe(stripeKey) : null;

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { items, customerEmail, customerName } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }
    if (!customerEmail) {
      return NextResponse.json({ error: 'Customer email is required' }, { status: 400 });
    }

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').trim();

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title || 'Healthcare Lead List',
          description: item.leadCount
            ? `${item.leadCount.toLocaleString()} verified healthcare leads`
            : 'Custom healthcare lead list',
        },
        unit_amount: Math.round((item.price || 0) * 100),
      },
      quantity: 1,
    }));

    const b2bListConfigs = items
      .filter((item: any) => item.listConfig)
      .map((item: any) => ({
        filterConfig: item.listConfig.filterConfig || item.listConfig,
        leadCount: item.leadCount || item.listConfig?.leadCount || 0,
        pricePerLead: item.listConfig?.pricePerLead || 0,
      }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/merci?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      customer_email: customerEmail,
      metadata: {
        customerName: customerName || '',
        customerEmail,
        items: JSON.stringify(items.map((i: any) => ({
          id: i.id,
          title: i.title,
          price: i.price,
          leadCount: i.leadCount,
        }))),
        hasB2BLists: b2bListConfigs.length > 0 ? 'true' : 'false',
        b2bListConfigs: JSON.stringify(b2bListConfigs),
      },
    });

    // Create order record in Supabase
    if (supabaseAdmin) {
      try {
        const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price || 0), 0);

        const { data: order } = await supabaseAdmin
          .from('orders')
          .insert({
            customer_email: customerEmail,
            customer_name: customerName || null,
            subtotal: totalAmount,
            total_amount: totalAmount,
            payment_method: 'stripe',
            payment_status: 'pending',
            stripe_session_id: session.id,
            status: 'pending',
          })
          .select()
          .single();

        if (order) {
          for (const config of b2bListConfigs) {
            await supabaseAdmin
              .from('list_orders')
              .insert({
                order_id: order.id,
                filter_config: config.filterConfig,
                lead_count: config.leadCount,
                price_per_lead: config.pricePerLead,
                total_price: config.leadCount * config.pricePerLead,
                status: 'pending',
              });
          }
        }
      } catch (dbError) {
        console.error('Failed to create order record:', dbError);
      }
    }

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
