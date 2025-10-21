type FormatPriceParams = {
  currency?: 'usd' | 'eur' | string
  maxFractionDigits?: number
}

export const formatPrice = (
  price: number,
  { currency, maxFractionDigits = 0 }: FormatPriceParams = {
    maxFractionDigits: 0,
  }
) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency?.toUpperCase() ?? 'USD',
    maximumFractionDigits: maxFractionDigits,
  })
  return formatter.format(price)
}