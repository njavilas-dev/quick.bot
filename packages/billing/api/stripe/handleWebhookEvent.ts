import { handleCheckoutSubscription } from './eventHandlers/handleCheckoutSubscription';
import { handleDeleteSubscription } from './eventHandlers/handleDeleteSubscription';
import { handlePastDueSubscription } from './eventHandlers/handlePastDueSubscription';
import { StripeService } from '../../services/StripeService';

export async function handleWebhookEvent(buf: Buffer | string, headers: any): Promise<{ status: string; message: string }> {
  const stripe = new StripeService();

  let event;
  try {
    event = await stripe.constructWebhookEvent(buf, headers);
  } catch (err) {
    console.error('Error verifying Stripe signature:', err);
    throw new Error('Invalid webhook signature');
  }

  switch (event.type) {
    case 'checkout.session.completed':
      return handleCheckoutSubscription(event);
    case 'customer.subscription.deleted':
      return handleDeleteSubscription(event);
    case 'customer.subscription.updated':
    case 'invoice.paid':
      return handlePastDueSubscription(event);
    default:
      return {
        status: 'ignored',
        message: `Event ${event.type} not handled`,
      };
  }
}
