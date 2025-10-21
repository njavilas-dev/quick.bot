import { CommandData } from '../types'

export const close = () => {
  const message: CommandData = {
    isFromBot: true,
    command: 'close',
  }
  window.postMessage(message)
}
