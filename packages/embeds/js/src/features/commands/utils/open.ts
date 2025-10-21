import { CommandData } from '../types'

export const open = () => {
  const message: CommandData = {
    isFromBot: true,
    command: 'open',
  }
  window.postMessage(message)
}
