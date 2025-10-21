import { CommandData } from '../types'

export const toggle = () => {
  const message: CommandData = {
    isFromBot: true,
    command: 'toggle',
  }
  window.postMessage(message)
}
