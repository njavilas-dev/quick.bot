import { trackPixelEvent } from '@/lib/pixel'
import { isEmpty } from '@quickbot.io/lib/utils'
import type { PixelBlock } from '@quickbot.io/schemas'

export const executePixel = async (options: PixelBlock['options']) => {
  if (isEmpty(options?.pixelId)) return
  trackPixelEvent(options)
}
