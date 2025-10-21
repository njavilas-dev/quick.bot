import { CommandData } from '../types'

export const hidePreviewMessage = () => {
  const message: CommandData = {
    isFromBot: true,
    command: 'hidePreviewMessage',
  }
  window.postMessage(message)
}
