import { ProductFormatOptions, WooCommerceProduct } from '../types/product.types'

export class ProductFormatterService {
  formatProducts(products: WooCommerceProduct[], options: ProductFormatOptions): string {
    if (!products?.length) {
      return 'No products found.'
    }

    const { formatType, includeLinks, includePrices } = options

    if (formatType === 'list') {
      return this.formatAsList(products, includeLinks, includePrices)
    } else {
      return this.formatAsDetail(products, includeLinks, includePrices)
    }
  }

  private formatAsList(
    products: WooCommerceProduct[],
    includeLinks: boolean,
    includePrices: boolean,
  ): string {
    return products
      .map((product, index) => {
        let productText = `**${product.name}**`

        if (includePrices && product.price) {
          productText += ` - $${product.price}`
        }

        if (includeLinks && product.permalink) {
          productText = `[${productText}](${product.permalink})`
        }

        return `${index + 1}. ${productText}`
      })
      .join('\n')
  }

  private formatAsDetail(
    products: WooCommerceProduct[],
    includeLinks: boolean,
    includePrices: boolean,
  ): string {
    return products
      .map((product) => {
        let productText = `**${product.name}**\n`

        if (includePrices && product.price) {
          productText += `Price: $${product.price}\n`
        }

        if (includeLinks && product.permalink) {
          productText += `[View Product](${product.permalink})\n`
        }

        return productText
      })
      .join('\n')
  }
}
