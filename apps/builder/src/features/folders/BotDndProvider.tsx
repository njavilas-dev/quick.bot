import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react'
import { BotInDashboard } from '@/features/bot/types'

const botDndContext = createContext<{
  draggedBot?: BotInDashboard
  setDraggedBot: Dispatch<SetStateAction<BotInDashboard | undefined>>
  mouseOverFolderId?: string | null
  setMouseOverFolderId: Dispatch<SetStateAction<string | undefined | null>>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
}>({})

export const BotDndProvider = ({ children }: { children: ReactNode }) => {
  const [draggedBot, setDraggedBot] = useState<BotInDashboard>()
  const [mouseOverFolderId, setMouseOverFolderId] = useState<string | null>()

  useEffect(() => {
    if (draggedBot) {
      document.body.classList.add('grabbing')
    } else {
      document.body.classList.remove('grabbing')
    }
  }, [draggedBot])

  return (
    <botDndContext.Provider
      value={{
        draggedBot,
        setDraggedBot,
        mouseOverFolderId,
        setMouseOverFolderId,
      }}
    >
      {children}
    </botDndContext.Provider>
  )
}

export const useBotDnd = () => useContext(botDndContext)
