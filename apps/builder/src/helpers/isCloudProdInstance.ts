import { env } from '@quickbot.io/env'

export const isCloudProdInstance = () => {
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'app.quick.bot'
  }
  return env.NEXTAUTH_URL === 'https://app.quick.bot'
}
