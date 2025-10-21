import { createBlock } from '@quickbot.io/forge'
import { WordpressLightLogo, WordpressDarkLogo } from './logo'
import { auth } from './auth'
import { loginToWordpress } from './actions/loginToWordpress'
import { registerWordpress } from './actions/registerWordpress'

export const wordpressBlock = createBlock({
  id: 'wordpress',
  name: 'WordPress',
  tags: ['wordpress', 'oauth', 'login', 'authentication', 'registration'],
  LightLogo: WordpressLightLogo,
  DarkLogo: WordpressDarkLogo,
  docsUrl: 'https://docs.quick.bot/builder/editor/blocks/integrations/wordpress',
  auth,
  actions: [loginToWordpress, registerWordpress],
})
