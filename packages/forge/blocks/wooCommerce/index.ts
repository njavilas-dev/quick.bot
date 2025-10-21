import { createBlock } from '@quickbot.io/forge'
import { auth } from './auth'
import { searchProducts } from './actions'
import { WooCommerceLogo } from './logo'
import { getProductById } from './actions/getProductById'

export const wooCommerceBlock = createBlock({
  id: 'woocommerce',
  name: 'Woo',
  tags: ['ecommerce', 'wordpress', 'woocommerce', 'woo'],
  LightLogo: WooCommerceLogo,
  auth,
  actions: [searchProducts, getProductById],
  docsUrl: 'https://docs.quick.bot/builder/editor/blocks/integrations/woocommerce',
})
