import { sendGaEvent } from '@/lib/gtag'
import { GoogleAnalyticsBlock } from '@quickbot.io/schemas'

export const executeGoogleAnalyticsBlock = async (options: GoogleAnalyticsBlock['options']) => {
  if (!options?.trackingId) return
  sendGaEvent(options)
}
