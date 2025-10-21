import {
  ContinueChatResponse,
  CustomEmbedBubble,
  Message,
  SessionState,
  SetVariableHistoryItem,
} from '@quickbot.io/schemas'

type EdgeId = string

export type ExecuteLogicResponse = {
  outgoingEdgeId: EdgeId | undefined
  newSessionState?: SessionState
  newSetVariableHistory?: SetVariableHistoryItem[]
} & Pick<ContinueChatResponse, 'clientSideActions' | 'logs'>

export type ExecuteIntegrationResponse = {
  outgoingEdgeId: EdgeId | undefined
  newSessionState?: SessionState
  startTimeShouldBeUpdated?: boolean
  customEmbedBubble?: CustomEmbedBubble
  newSetVariableHistory?: SetVariableHistoryItem[]
} & Pick<ContinueChatResponse, 'clientSideActions' | 'logs'>

export type Reply = Message | undefined

export type ParsedReply =
  | { status: 'success'; reply: string; value?: string; useDefault?: boolean }
  | { status: 'fail' }
  | { status: 'skip' }
