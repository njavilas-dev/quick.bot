import { OpenAI } from 'openai'
import { decryptV2 } from '@quickbot.io/lib/api/encryption/decryptV2'
import { forgedBlocks } from '@quickbot.io/forge-repository/definitions'
import { AsyncVariableStore } from '@quickbot.io/forge'
import { getBlockById } from '@quickbot.io/schemas/helpers'
import { isForgedBlockType } from '@quickbot.io/schemas/features/blocks/forged/helpers'
import { ParseVariablesOptions, parseVariables } from '@quickbot.io/variables/parseVariables'
import { getUpdatedVariablesInSession } from '@quickbot.io/variables/getUpdatedVariablesInSession'
import { deepParseVariables } from '@quickbot.io/variables/deepParseVariables'
import { getCredentials } from '../queries/getCredentials'
import { getSession } from '../queries/getSession'
import { updateSession } from '../queries/updateSession'
import { saveSetVariableHistoryItems } from '../queries/saveSetVariableHistoryItems'

type Props = {
  sessionId: string
}

export const getMessageStream = async ({
  sessionId
}: Props): Promise<{
  stream?: ReadableStream<any>
  status?: number
  message?: string
}> => {
  const session = await getSession(sessionId)

  if (!session?.state || !session.state.currentBlockId)
    return { status: 404, message: 'Could not find session' }

  const { group, block } = getBlockById(
    session.state.currentBlockId,
    session.state.botsQueue[0].bot.groups,
  )
  if (!block || !group)
    return {
      status: 404,
      message: 'Could not find block or group',
    }

  if (!('options' in block))
    return {
      status: 400,
      message: 'This block does not have options',
    }

  if (!isForgedBlockType(block.type))
    return {
      status: 400,
      message: 'This block does not have a stream function',
    }

  const blockDef = forgedBlocks[block.type]
  const action = blockDef?.actions.find((a) => a.name === block.options?.action)

  if (!action?.run?.stream) {
    return {
      status: 400,
      message: 'This block does not have a stream function',
    }
  }

  try {

    if (!block.options.credentialsId) {
      return {
        status: 404,
        message: 'Could not find credentials'
      }
    }

    const credentials = await getCredentials(block.options.credentialsId)

    if (!credentials) {
      return {
        status: 404,
        message: 'Could not find credentials'
      }
    }

    const decryptedCredentials = await decryptV2(credentials.data, credentials.iv)

    const variables: AsyncVariableStore = {
      parse: (text: string, params?: ParseVariablesOptions) => {
        return parseVariables(variables.list(), params)(text)
      },
      get: (id: string) => {
        const variable = variables.list().find(
          (variable) => variable.id === id,
        )
        return variable?.value
      },
      set: async (id: string, value: unknown) => {
        const variable = variables.list().find(
          (variable) => variable.id === id,
        )
        if (!variable) return

        const { updatedState } = getUpdatedVariablesInSession({
          newVariables: [{ ...variable, value }],
          state: session.state,
          currentBlockId: session.state.currentBlockId,
        })

        session.state = updatedState // Update session state in memory only
      },
      save: async (id: string, value: unknown) => {
        const variable = variables.list().find(
          (variable) => variable.id === id,
        )
        if (!variable) return

        const { updatedState, newSetVariableHistory } = getUpdatedVariablesInSession({
          newVariables: [{ ...variable, value }],
          state: session.state,
          currentBlockId: session.state.currentBlockId,
        })

        if (newSetVariableHistory.length > 0 && session.state.botsQueue[0].resultId) {
          await saveSetVariableHistoryItems(newSetVariableHistory)
        }

        session.state = updatedState // Update session state in memory only

        await updateSession({
          id: session.id,
          state: updatedState,
          isReplying: undefined,
        })
      },
      list: () => {
        return session.state.botsQueue[0].bot.variables ?? []
      },
    }
    const { stream, httpError } = await action.run.stream.run({
      credentials: decryptedCredentials,
      options: deepParseVariables(variables.list())(block.options),
      variables,
    })

    if (httpError) {
      return httpError
    }

    if (!stream) {
      return {
        status: 500,
        message: 'Could not create stream'
      }
    }

    return {
      stream
    }

  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      const { message } = error
      return {
        status: 500,
        message,
      }
    }
    return {
      status: 500,
      message: 'Could not create stream',
    }
  }
}
