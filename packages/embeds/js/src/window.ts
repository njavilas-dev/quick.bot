import { BubbleProps } from './features/bubble'
import { PopupProps } from './features/popup'
import { BotProps } from './components/Bot'
import {
  close,
  hidePreviewMessage,
  open,
  setPrefilledVariables,
  showPreviewMessage,
  toggle,
  setInputValue,
  unmount,
} from './features/commands'

const initStandard = (props: BotProps & { id?: string }) => {
  const standardElement = props.id
    ? document.getElementById(props.id)
    : document.querySelector('quickbot-standard')
  if (!standardElement) throw new Error('<quickbot-standard> element not found.')
  Object.assign(standardElement, props)
}

const initPopup = (props: PopupProps) => {
  const popupElement = document.createElement('quickbot-popup')
  Object.assign(popupElement, props)
  document.body.prepend(popupElement)
}

const initBubble = (props: BubbleProps) => {
  const bubbleElement = document.createElement('bot-bubble')
  Object.assign(bubbleElement, props)
  document.body.prepend(bubbleElement)
}

type Bot = {
  initStandard: typeof initStandard
  initPopup: typeof initPopup
  initBubble: typeof initBubble
  close: typeof close
  hidePreviewMessage: typeof hidePreviewMessage
  open: typeof open
  setPrefilledVariables: typeof setPrefilledVariables
  showPreviewMessage: typeof showPreviewMessage
  toggle: typeof toggle
  setInputValue: typeof setInputValue
  unmount: typeof unmount
}

declare const window:
  | {
      Bot: Bot | undefined
    }
  | undefined

export const parseBot = () => ({
  initStandard,
  initPopup,
  initBubble,
  close,
  hidePreviewMessage,
  open,
  setPrefilledVariables,
  showPreviewMessage,
  toggle,
  setInputValue,
  unmount,
})

export const injectBotInWindow = (bot: Bot) => {
  if (typeof window === 'undefined') return
  window.Bot = { ...bot }
}
