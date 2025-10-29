import type { Theme } from '@quickbot.io/schemas'
import { colorToRgb, parseColorWithAlpha } from '@quickbot.io/lib/hexToRgb'
import { isDefined } from '@quickbot.io/lib'
import {
  defaultHostBubblesBackgroundColor,
  defaultHostBubblesColor,
  defaultGuestBubblesBackgroundColor,
  defaultGuestBubblesColor,
  defaultOpacity,
  defaultRoundness,
} from '@quickbot.io/schemas/features/bot/theme/constants'

function getBorderRadius(
  roundness: 'none' | 'medium' | 'large' | 'custom',
  customValue?: number,
): string {
  switch (roundness) {
    case 'none':
      return '0'
    case 'medium':
      return '6px'
    case 'large':
      return '20px'
    case 'custom':
      return `${customValue ?? 6}px`
    default:
      return '6px'
  }
}

export const injectChatTheme = (theme: Theme | undefined): React.CSSProperties => {
  if (!theme) return {}

  const cssVars: Record<string, string> = {}

  const hostBubbles = theme.chat?.hostBubbles
  const hostBgColor = hostBubbles?.backgroundColor ?? defaultHostBubblesBackgroundColor
  const hostColorData = parseColorWithAlpha(hostBgColor)

  cssVars['--quickbot-host-bubble-bg-rgb'] = hostColorData.rgb.join(', ')
  cssVars['--quickbot-host-bubble-color'] = hostBubbles?.color ?? defaultHostBubblesColor

  const hostEffectiveOpacity =
    hostBgColor === 'transparent'
      ? '0'
      : hostColorData.alpha !== 1
      ? hostColorData.alpha.toString()
      : (hostBubbles?.opacity ?? defaultOpacity).toString()

  cssVars['--quickbot-host-bubble-opacity'] = hostEffectiveOpacity

  cssVars['--quickbot-host-bubble-border-width'] = isDefined(hostBubbles?.border?.thickness)
    ? `${hostBubbles?.border?.thickness}px`
    : '0px'

  cssVars['--quickbot-host-bubble-border-rgb'] = colorToRgb(hostBubbles?.border?.color ?? '').join(
    ', ',
  )

  cssVars['--quickbot-host-bubble-border-opacity'] = isDefined(hostBubbles?.border?.opacity)
    ? hostBubbles.border.opacity.toString()
    : defaultOpacity.toString()

  cssVars['--quickbot-host-bubble-border-radius'] = getBorderRadius(
    (hostBubbles?.border?.roundeness ?? theme.chat?.roundness ?? defaultRoundness) as
      | 'none'
      | 'medium'
      | 'large'
      | 'custom',
    hostBubbles?.border?.customRoundeness,
  )

  const guestBubbles = theme.chat?.guestBubbles
  const guestBgColor = guestBubbles?.backgroundColor ?? defaultGuestBubblesBackgroundColor
  const guestColorData = parseColorWithAlpha(guestBgColor)

  cssVars['--quickbot-guest-bubble-bg-rgb'] = guestColorData.rgb.join(', ')
  cssVars['--quickbot-guest-bubble-color'] = guestBubbles?.color ?? defaultGuestBubblesColor

  const guestEffectiveOpacity =
    guestBgColor === 'transparent'
      ? '0'
      : guestColorData.alpha !== 1
      ? guestColorData.alpha.toString()
      : (guestBubbles?.opacity ?? defaultOpacity).toString()

  cssVars['--quickbot-guest-bubble-opacity'] = guestEffectiveOpacity

  cssVars['--quickbot-guest-bubble-border-width'] = isDefined(guestBubbles?.border?.thickness)
    ? `${guestBubbles?.border?.thickness}px`
    : '0px'

  cssVars['--quickbot-guest-bubble-border-rgb'] = colorToRgb(
    guestBubbles?.border?.color ?? '',
  ).join(', ')

  cssVars['--quickbot-guest-bubble-border-opacity'] = isDefined(guestBubbles?.border?.opacity)
    ? guestBubbles.border.opacity.toString()
    : defaultOpacity.toString()

  cssVars['--quickbot-guest-bubble-border-radius'] = getBorderRadius(
    (guestBubbles?.border?.roundeness ?? theme.chat?.roundness ?? defaultRoundness) as
      | 'none'
      | 'medium'
      | 'large'
      | 'custom',
    guestBubbles?.border?.customRoundeness,
  )

  if (theme.general?.font) {
    const fontSize =
      typeof theme.general.font === 'string'
        ? undefined
        : 'size' in theme.general.font
        ? theme.general.font.size
        : undefined
    if (fontSize) {
      cssVars['--quickbot-font-size'] = `${fontSize}px`
    }
  }

  return cssVars as React.CSSProperties
}
