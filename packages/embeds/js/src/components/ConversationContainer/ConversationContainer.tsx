import { InputBlock, StartChatResponse } from '@quickbot.io/schemas'
import { BotContext, OutgoingLog } from '@/types'
import { InputAnswerProvider } from '../InputAnswerContext'
import { ConversationContainerBody } from './ConversationContainerBody'
import { ConversationContainerFooter } from './ConversationContainerFooter'

type Props = {
  botContainer: HTMLDivElement | undefined
  initialChatReply: StartChatResponse
  context: BotContext
  onNewInputBlock?: (inputBlock: InputBlock) => void
  onAnswer?: (answer: { message: string; blockId: string }) => void
  onEnd?: () => void
  onNewLogs?: (logs: OutgoingLog[]) => void
  onProgressUpdate?: (progress: number) => void
}

export const ConversationContainer = (props: Props) => {
  return (
    <InputAnswerProvider {...props}>
      <ConversationContainerBody {...props} />
      <ConversationContainerFooter {...props} />
    </InputAnswerProvider>
  )
}
