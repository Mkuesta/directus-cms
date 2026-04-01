import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase/server';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';

export const runtime = 'nodejs';

const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
const stripe = stripeKey ? new Stripe(stripeKey) : null;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim() || '';

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature found' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log('Payment successful:', {
          sessionId: session.id,
          customerEmail: session.customer_email,
          amountTotal: session.amount_total,
        });

        if (supabaseAdmin) {
          // Update order status
          const { data: order } = await supabaseAdmin
            .from('orders')
            .update({
              payment_status: 'paid',
              status: 'paid',
              stripe_payment_intent_id: session.payment_intent as string,
            })
            .eq('stripe_session_id', session.id)
            .select()
            .single();

          if (order) {
            // Generate download token
            const downloadToken = crypto.randomUUID();
            const downloadExpires = new Date();
            downloadExpires.setDate(downloadExpires.getDate() + 30);

            await supabaseAdmin
              .from('orders')
              .update({
                download_token: downloadToken,
                download_expires_at: downloadExpires.toISOString(),
                status: 'completed',
              })
              .eq('id', order.id);

            // Trigger CSV generation for list orders
            const { data: listOrders } = await supabaseAdmin
              .from('list_orders')
              .select('*')
              .eq('order_id', order.id)
              .eq('status', 'pending');

            const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').trim();

            for (const listOrder of listOrders || []) {
              fetch(`${baseUrl}/api/list-builder/generate-csv`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  listOrderId: listOrder.id,
                  filterConfig: listOrder.filter_config,
                }),
              }).catch(err => {
                console.error('CSV generation error:', err);
              });
            }

            // Send download email
            const customerEmail = session.customer_email || order.customer_email;
            if (customerEmail && resend) {
              const downloadUrl = `${baseUrl}/api/downloads/${downloadToken}`;
              try {
                await resend.emails.send({
                  from: emailFrom,
                  to: [customerEmail],
                  subject: 'Your MedLead Data is Ready',
                  html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                      <h1 style="color: #005c5c;">Your Healthcare Data is Ready!</h1>
                      <p>Thank you for your purchase. Your data files are being prepared and will be available at the link below.</p>
                      <p style="margin: 24px 0;">
                        <a href="${downloadUrl}" style="background: #005c5c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                          Download Your Data
                        </a>
                      </p>
                      <p style="color: #666; font-size: 14px;">
                        This link expires in 30 days. You can download up to 5 times.<br/>
                        Order: ${order.order_number}
                      </p>
                      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                      <p style="color: #999; font-size: 12px;">
                        MedLead - Healthcare Lead Generation<br/>
                        Questions? Contact sales@medlead.com
                      </p>
                    </div>
                  `,
                });
                console.log('Download email sent to:', customerEmail);
              } catch (emailErr) {
                console.error('Failed to send download email:', emailErr);
              }
            }
          }
        }

        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session expired:', session.id);

        if (supabaseAdmin) {
          await supabaseAdmin
            .from('orders')
            .update({ status: 'cancelled', payment_status: 'expired' })
            .eq('stripe_session_id', session.id);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: error.message || 'Webhook handler failed' }, { status: 500 });
  }
}
