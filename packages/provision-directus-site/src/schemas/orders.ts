import type { CollectionSchema } from '../types.js';

export function ordersSchema(prefix: string): CollectionSchema {
  const collection = `${prefix}_orders`;
  return {
    collection,
    group: 'data',
    fields: [
      { field: 'stripe_session_id', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, note: 'Stripe Checkout Session ID. Used to link this order to its payment session.' } },
      { field: 'stripe_payment_intent', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', note: 'Stripe Payment Intent ID. Set after payment is processed.' } },
      { field: 'customer_email', type: 'string', schema: { is_nullable: false }, meta: { interface: 'input', required: true, width: 'half', note: 'Customer email address from the checkout session.' } },
      { field: 'customer_name', type: 'string', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Customer name from the checkout session.' } },
      {
        field: 'status', type: 'string', schema: { is_nullable: false, default_value: 'pending' },
        meta: {
          interface: 'select-dropdown', width: 'half',
          options: { choices: [{ text: 'Pending', value: 'pending' }, { text: 'Paid', value: 'paid' }, { text: 'Failed', value: 'failed' }, { text: 'Refunded', value: 'refunded' }, { text: 'Cancelled', value: 'cancelled' }] },
          note: 'Current order status. Updated automatically by Stripe webhooks.',
        },
      },
      { field: 'line_items', type: 'json', schema: { is_nullable: true }, meta: { interface: 'input-code', special: ['cast-json'], note: 'Array of line items: [{name, description, quantity, unit_price, product_id}]' } },
      { field: 'subtotal', type: 'decimal', schema: { is_nullable: false, numeric_precision: 10, numeric_scale: 2 }, meta: { interface: 'input', width: 'half', required: true, note: 'Order subtotal before tax. Example: 59.98' } },
      { field: 'tax', type: 'decimal', schema: { is_nullable: false, numeric_precision: 10, numeric_scale: 2, default_value: 0 }, meta: { interface: 'input', width: 'half', note: 'Tax amount. Updated from Stripe after payment.' } },
      { field: 'total', type: 'decimal', schema: { is_nullable: false, numeric_precision: 10, numeric_scale: 2 }, meta: { interface: 'input', width: 'half', required: true, note: 'Order total including tax. Example: 71.38' } },
      { field: 'currency', type: 'string', schema: { is_nullable: false, default_value: 'eur' }, meta: { interface: 'input', width: 'half', note: 'ISO 4217 currency code. Example: eur, usd' } },
      { field: 'site', type: 'integer', schema: { is_nullable: true }, meta: { interface: 'input', width: 'half', note: 'Site reference for multi-tenancy. Leave empty for the default site.' } },
      { field: 'metadata', type: 'json', schema: { is_nullable: true }, meta: { interface: 'input-code', special: ['cast-json'], note: 'Additional metadata passed through from the checkout session.' } },
      { field: 'date_created', type: 'timestamp', schema: { is_nullable: true }, meta: { interface: 'datetime', special: ['date-created'], readonly: true, width: 'half', note: 'Auto-generated timestamp when the order was created. Do not edit.' } },
      { field: 'date_updated', type: 'timestamp', schema: { is_nullable: true }, meta: { interface: 'datetime', special: ['date-updated'], readonly: true, width: 'half', note: 'Auto-generated timestamp of the last update. Do not edit.' } },
    ],
  };
}
