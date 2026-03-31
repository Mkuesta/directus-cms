import Stripe from 'stripe';

let _instance: Stripe | null = null;
let _instanceKey: string | null = null;

/**
 * Get or create a singleton Stripe instance.
 * Reuses the same instance as long as the secret key hasn't changed.
 */
export function getStripe(secretKey: string): Stripe {
  if (_instance && _instanceKey === secretKey) return _instance;

  _instance = new Stripe(secretKey);
  _instanceKey = secretKey;
  return _instance;
}
