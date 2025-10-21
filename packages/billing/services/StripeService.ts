import { Stripe } from 'stripe'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { env } from '@quickbot.io/env'
import { getStripePlanPriceId } from '../helpers/getStripePlanPriceId'
import { getStripePlanChatPriceId } from '../helpers/getStripePlanChatPriceId'
import { BillingPlanType } from '@quickbot.io/prisma'

interface CheckoutSessionParams {
  customerId: string
  workspaceId: string
  billingPlan: BillingPlanType
  currency?: string
  returnUrl: string
}

interface CustomerParams {
  email: string
  name: string
  workspaceId: string
  taxIdData?: Array<Stripe.CustomerCreateParams.TaxIdDatum>
}

export class StripeService {
  private stripe: Stripe

  constructor() {
    this.stripe = this.getStripeInstance()
  }

  getStripeInstance = (): Stripe => {
    if (this.stripe) {
      return this.stripe
    }
    if (!env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe environment variables are missing')
    }
    return new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' })
  }

  async getWebhookSecret(): Promise<string> {

    if (!env.TEST_ENV) {
      if (!env.STRIPE_WEBHOOK_SECRET) {
        throw new Error('STRIPE_WEBHOOK_SECRET is missing')
      }
      return Promise.resolve(env.STRIPE_WEBHOOK_SECRET)
    }

    const secretFilePath = path.resolve(process.cwd(), '../../.stripe')
    const maxRetries = 5
    let retries = 0

    while (retries < maxRetries) {
      if (existsSync(secretFilePath)) {
        return Promise.resolve(readFileSync(secretFilePath, 'utf-8').trim())
      }
      retries++
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    throw new Error('Env variable STRIPE_WEBHOOK_SECRET not found (E2E).')
  }

  async constructWebhookEvent(buf: Buffer | string, headers: any): Promise<Stripe.Event> {
    const signature = headers['stripe-signature']

    if (!signature) {
      throw new Error('Missing stripe-signature header')
    }

    try {
      const webhookSecret = await this.getWebhookSecret()
      return this.stripe.webhooks.constructEvent(buf.toString(), signature, webhookSecret)
    } catch (error) {
      console.error('Error verifying Stripe signature:', error)
      throw new Error('Invalid webhook signature')
    }
  }

  async createCheckoutSession({
    customerId,
    workspaceId,
    billingPlan,
    currency = 'usd',
    returnUrl,
  }: CheckoutSessionParams): Promise<Stripe.Checkout.Session> {
    const line_items = [
      {
        price: getStripePlanPriceId(billingPlan),
        quantity: 1,
      },
      {
        price: getStripePlanChatPriceId(billingPlan),
      },
    ]

    try {
      return await this.stripe.checkout.sessions.create({
        success_url: `${returnUrl}?stripe=${billingPlan}&success=true`,
        cancel_url: `${returnUrl}?stripe=cancel`,
        customer: customerId,
        mode: 'subscription',
        metadata: { workspaceId, billingPlan },
        currency,
        line_items,
      })
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    }
  }

  async createBillingPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<Stripe.BillingPortal.Session> {
    try {
      return await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      })
    } catch (error) {
      console.error('Error creating billing portal session:', error)
      throw error
    }
  }

  async updateSubscription(
    subscriptionId: string,
    items: Stripe.SubscriptionUpdateParams.Item[],
  ): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.update(subscriptionId, {
        items,
        proration_behavior: 'always_invoice',
      })
    } catch (error) {
      console.error('Error updating subscription:', error)
      throw error
    }
  }

  async cancelSubscription(customerId: string): Promise<void> {
    try {
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
        limit: 1,
        status: 'active',
      })
      for (const subscription of subscriptions.data) {
        await this.stripe.subscriptions.cancel(subscription.id)
      }
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw error
    }
  }

  async listInvoices(
    customerId: string,
    limit: number = 50,
    status?: Stripe.InvoiceListParams.Status,
  ): Promise<Stripe.ApiList<Stripe.Invoice>> {
    try {
      return await this.stripe.invoices.list({
        customer: customerId,
        status,
        limit,
      })
    } catch (error) {
      console.error('Error listing invoices:', error)
      throw error
    }
  }

  async getSubscription(
    customerId: string,
    status: Stripe.SubscriptionListParams.Status = 'active',
  ): Promise<Stripe.Subscription | null> {
    try {
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
        limit: 1,
        status,
      })
      return subscriptions.data[0] || null
    } catch (error) {
      console.error('Error getting last active subscription:', error)
      throw error
    }
  }

  async createCustomer({
    email,
    name,
    workspaceId,
    taxIdData,
  }: CustomerParams): Promise<Stripe.Customer> {
    try {
      return await this.stripe.customers.create({
        email,
        name,
        metadata: { workspaceId },
        tax_id_data: taxIdData,
      })
    } catch (error) {
      console.error('Error creating customer:', error)
      throw error
    }
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId)
      if (customer.deleted) {
        throw new Error('Customer has been deleted')
      }
      return customer as Stripe.Customer
    } catch (error) {
      console.error('Error getting customer:', error)
      throw error
    }
  }
}
