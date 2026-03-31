let _orderId = 1;

export function resetOrderCounter() { _orderId = 1; }

export function createDirectusOrder(overrides?: Record<string, any>) {
  const id = _orderId++;
  return {
    id,
    stripe_session_id: `cs_test_${id}`,
    stripe_payment_intent: `pi_test_${id}`,
    customer_email: `customer${id}@example.com`,
    customer_name: `Customer ${id}`,
    status: 'paid',
    line_items: [
      { name: `Product ${id}`, description: 'Test product', quantity: 1, unit_price: 29.99, product_id: id },
    ],
    subtotal: 29.99,
    tax: 5.70,
    total: 35.69,
    currency: 'eur',
    site: 1,
    metadata: null,
    date_created: '2024-01-15T10:00:00Z',
    date_updated: null,
    ...overrides,
  };
}

export function createOrder(overrides?: Record<string, any>) {
  const id = _orderId++;
  return {
    id,
    stripeSessionId: `cs_test_${id}`,
    stripePaymentIntent: `pi_test_${id}`,
    customerEmail: `customer${id}@example.com`,
    customerName: `Customer ${id}`,
    status: 'paid' as const,
    lineItems: [
      { name: `Product ${id}`, description: 'Test product', quantity: 1, unitPrice: 29.99, productId: id },
    ],
    subtotal: 29.99,
    tax: 5.70,
    total: 35.69,
    currency: 'eur',
    metadata: null,
    ...overrides,
  };
}
