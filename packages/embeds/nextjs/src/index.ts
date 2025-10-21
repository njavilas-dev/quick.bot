import type { BotProps, PopupProps, BubbleProps } from '@urbiport/js/dist/index'
import dynamic from 'next/dynamic.js'

export const Standard: React.ComponentType<
  BotProps & {
    style?: React.CSSProperties
    className?: string
  }
> = dynamic(() => import('@urbiport/react/src/Standard'), { ssr: false })

export const Popup: React.ComponentType<PopupProps> = dynamic(
  () => import('@urbiport/react/src/Popup'),
  {
    ssr: false,
  },
)

export const Bubble: React.ComponentType<BubbleProps> = dynamic(
  () => import('@urbiport/react/src/Bubble'),
  {
    ssr: false,
  },
)

export * from '@urbiport/js'
