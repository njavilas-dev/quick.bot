import Stripe from 'stripe'

export const formatVatData = (workspace: { billingVatValue?: string, billingVatType?: string }): Stripe.CustomerCreateParams.TaxIdDatum[] | undefined => {
  const { billingVatValue, billingVatType } = workspace;

  if (!billingVatValue || !billingVatType) {
    return undefined
  }
  return [
    {
      type: billingVatType as Stripe.CustomerCreateParams.TaxIdDatum.Type,
      value: billingVatValue,
    },
  ]
}