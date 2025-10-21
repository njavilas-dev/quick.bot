import Stripe from 'stripe'
import { promptAndSetEnvironment } from './utils'
import { personalChatTiers, businessChatTiers, enterpriseChatTiers } from './chatTiers.js'

const chatsProductId = 'prod_MVXtq5sATQzIcM'

const createChatsPrices = async () => {
  await promptAndSetEnvironment()

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2022-11-15',
  })

  await stripe.prices.create({
    currency: 'usd',
    billing_scheme: 'tiered',
    recurring: {
      interval: 'month',
      usage_type: 'metered',
      aggregate_usage: 'last_during_period',
    },
    tiers: personalChatTiers,
    tiers_mode: 'volume',
    tax_behavior: 'exclusive',
    product: chatsProductId,
    currency_options: {
      eur: {
        tax_behavior: 'exclusive',
        tiers: personalChatTiers,
      },
    },
  })

  await stripe.prices.create({
    currency: 'usd',
    billing_scheme: 'tiered',
    recurring: {
      interval: 'month',
      usage_type: 'metered',
      aggregate_usage: 'last_during_period',
    },
    tiers: businessChatTiers,
    tiers_mode: 'volume',
    tax_behavior: 'exclusive',
    product: chatsProductId,
    currency_options: {
      eur: {
        tax_behavior: 'exclusive',
        tiers: businessChatTiers,
      },
    },
  })
}

createChatsPrices()
