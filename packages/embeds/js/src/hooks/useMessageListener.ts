import { onCleanup, onMount } from 'solid-js'
import { CommandData } from '@/features/commands/types'

type MessageEventHandler = (event: MessageEvent<CommandData>) => void

/**
 * Hook to handle window message event listeners
 * Automatically sets up and cleans up the event listener
 * 
 * @param handler - Function to handle incoming message events
 */
export const useMessageListener = (handler: MessageEventHandler) => {
  const processIncomingEvent = (event: MessageEvent<CommandData>) => {
    const { data } = event
    
    if (!data.isFromBot) return
    handler(event)
  }

  onMount(() => {
    window.addEventListener('message', processIncomingEvent)
  })

  onCleanup(() => {
    window.removeEventListener('message', processIncomingEvent)
  })
}