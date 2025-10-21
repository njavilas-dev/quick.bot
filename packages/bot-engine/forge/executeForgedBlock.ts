import { VariableStore, LogsStore } from '@quickbot.io/forge'
import { forgedBlocks } from '@quickbot.io/forge-repository/definitions'
import { ForgedBlock } from '@quickbot.io/forge-repository/types'
import { decrypt } from '@quickbot.io/lib/api/encryption/decrypt'
import {
  SessionState,
  ContinueChatResponse,
  Block,
  BotInSession,
  SetVariableHistoryItem,
} from '@quickbot.io/schemas'
import { deepParseVariables } from '@quickbot.io/variables/deepParseVariables'
import { ParseVariablesOptions, parseVariables } from '@quickbot.io/variables/parseVariables'
import { getUpdatedVariablesInSession } from '@quickbot.io/variables/getUpdatedVariablesInSession'
import { ExecuteIntegrationResponse } from '../types'
import { byId } from '@quickbot.io/lib'
import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { getCredentials } from '../queries/getCredentials'

export const executeForgedBlock = async (
  state: SessionState,
  block: ForgedBlock,
): Promise<ExecuteIntegrationResponse> => {
  const blockDef = forgedBlocks[block.type]
  if (!blockDef) return { outgoingEdgeId: block.outgoingEdgeId }
  const action = blockDef.actions.find((a) => a.name === block.options.action)
  const noCredentialsError = {
    status: 'error',
    description: 'Credentials not provided for integration',
  }

  let credentials: { data: string; iv: string } | null = null
  if (blockDef.auth) {
    if (!block.options.credentialsId) {
      return {
        outgoingEdgeId: block.outgoingEdgeId,
        logs: [noCredentialsError],
      }
    }
    credentials = await getCredentials(block.options.credentialsId)
    if (!credentials) {
      console.error('Could not find credentials in database')
      return {
        outgoingEdgeId: block.outgoingEdgeId,
        logs: [noCredentialsError],
      }
    }
  }

  const bot = state.botsQueue[0].bot
  if (
    action?.run?.stream &&
    isNextBubbleTextWithStreamingVar(bot)(
      block.id,
      action.run.stream.getStreamVariableId(block.options),
    ) &&
    state.isStreamEnabled &&
    !state.whatsApp
  ) {
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      clientSideActions: [
        {
          type: 'stream',
          expectsDedicatedReply: true,
          stream: true,
        },
      ],
    }
  }

  let newSessionState = state
  let setVariableHistory: SetVariableHistoryItem[] = []

  const variables: VariableStore = {
    get: (id: string) => {
      const variable = newSessionState.botsQueue[0].bot.variables.find(
        (variable) => variable.id === id,
      )
      return variable?.value
    },
    set: (id: string, value: unknown) => {
      const variable = newSessionState.botsQueue[0].bot.variables.find(
        (variable) => variable.id === id,
      )
      if (!variable) return
      const { newSetVariableHistory, updatedState } = getUpdatedVariablesInSession({
        newVariables: [{ ...variable, value }],
        state: newSessionState,
        currentBlockId: block.id,
      })
      newSessionState = updatedState
      setVariableHistory.push(...newSetVariableHistory)
    },
    parse: (text: string, params?: ParseVariablesOptions) =>
      parseVariables(newSessionState.botsQueue[0].bot.variables, params)(text),
    list: () => newSessionState.botsQueue[0].bot.variables,
  }
  let logs: NonNullable<ContinueChatResponse['logs']> = []
  const logsStore: LogsStore = {
    add: (log) => {
      if (typeof log === 'string') {
        logs.push({
          status: 'error',
          description: log,
        })
        return
      }
      logs.push(log)
    },
  }
  const credentialsData = credentials ? await decrypt(credentials.data, credentials.iv) : undefined

  const parsedOptions = deepParseVariables(state.botsQueue[0].bot.variables, {
    removeEmptyStrings: true,
  })(block.options)
  await action?.run?.server?.({
    credentials: credentialsData ?? {},
    options: parsedOptions,
    variables,
    logs: logsStore,
  })

  const clientSideActions: ExecuteIntegrationResponse['clientSideActions'] = []

  if (action?.run?.web?.parseFunction) {
    clientSideActions.push({
      type: 'codeToExecute',
      codeToExecute: action?.run?.web?.parseFunction({
        options: parsedOptions,
      }),
    })
  }

  return {
    newSessionState,
    outgoingEdgeId: block.outgoingEdgeId,
    logs,
    clientSideActions,
    customEmbedBubble: action?.run?.web?.displayEmbedBubble
      ? {
        type: 'custom-embed',
        content: {
          url: action.run.web.displayEmbedBubble.parseUrl({
            options: parsedOptions,
          }),
          initFunction: action.run.web.displayEmbedBubble.parseInitFunction({
            options: parsedOptions,
          }),
          waitForEventFunction: action.run.web.displayEmbedBubble.waitForEvent?.parseFunction?.({
            options: parsedOptions,
          }),
        },
      }
      : undefined,
    newSetVariableHistory: setVariableHistory,
  }
}

const isNextBubbleTextWithStreamingVar =
  (bot: BotInSession) =>
    (blockId: string, streamVariableId?: string): boolean => {
      const streamVariable = bot.variables.find((variable) => variable.id === streamVariableId)
      if (!streamVariable) return false
      const nextBlock = getNextBlock(bot)(blockId)
      if (!nextBlock) return false
      return (
        nextBlock.type === BubbleBlockType.TEXT &&
        (nextBlock.content?.richText?.length ?? 0) > 0 &&
        nextBlock.content?.richText?.at(0)?.children.at(0).text === `{{${streamVariable.name}}}`
      )
    }

const getNextBlock =
  (bot: BotInSession) =>
    (blockId: string): Block | undefined => {
      const group = bot.groups.find((group) => group.blocks.find(byId(blockId)))
      if (!group) return
      const blockIndex = group.blocks.findIndex(byId(blockId))
      const nextBlockInGroup = group.blocks.at(blockIndex + 1)
      if (nextBlockInGroup) return nextBlockInGroup
      const outgoingEdgeId = group.blocks.at(blockIndex)?.outgoingEdgeId
      if (!outgoingEdgeId) return
      const outgoingEdge = bot.edges.find(byId(outgoingEdgeId))
      if (!outgoingEdge) return
      const connectedGroup = bot.groups.find(byId(outgoingEdge?.to.groupId))
      if (!connectedGroup) return
      return outgoingEdge.to.blockId
        ? connectedGroup.blocks.find((block) => block.id === outgoingEdge.to.blockId)
        : connectedGroup?.blocks.at(0)
    }

const isCredentialsV2 = (credentials: { iv: string }) => credentials.iv.length === 24
