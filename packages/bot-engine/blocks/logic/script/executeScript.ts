import { ExecuteLogicResponse } from '../../../types'
import { ScriptBlock, SessionState, Variable } from '@quickbot.io/schemas'
import { extractVariablesFromText } from '@quickbot.io/variables/extractVariablesFromText'
import { parseGuessedValueType } from '@quickbot.io/variables/parseGuessedValueType'
import { parseVariables } from '@quickbot.io/variables/parseVariables'
import { defaultScriptOptions } from '@quickbot.io/schemas/features/blocks/logic/script/constants'
import { executeFunction } from '@quickbot.io/variables/executeFunction'
import { getUpdatedVariablesInSession } from '@quickbot.io/variables/getUpdatedVariablesInSession'

export const executeScript = async (
  state: SessionState,
  block: ScriptBlock,
): Promise<ExecuteLogicResponse> => {
  const { variables } = state.botsQueue[0].bot
  if (!block.options?.content) return { outgoingEdgeId: block.outgoingEdgeId }

  const isExecutedOnClient =
    block.options.isExecutedOnClient ?? defaultScriptOptions.isExecutedOnClient

  if (!isExecutedOnClient) {
    const { newVariables, error } = await executeFunction({
      variables,
      body: block.options.content,
    })

    const updateVarResults = newVariables
      ? getUpdatedVariablesInSession({
        newVariables,
        state,
        currentBlockId: block.id,
      })
      : undefined

    let newSessionState = state

    if (updateVarResults) {
      newSessionState = updateVarResults.updatedState
    }

    return {
      outgoingEdgeId: block.outgoingEdgeId,
      logs: error ? [{ status: 'error', description: error }] : [],
      newSessionState,
      newSetVariableHistory: updateVarResults?.newSetVariableHistory,
    }
  }

  const scriptToExecute = parseScriptToExecuteClientSideAction(variables, block.options.content)

  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions: [
      {
        type: 'scriptToExecute',
        scriptToExecute: scriptToExecute,
      },
    ],
  }
}

export const parseScriptToExecuteClientSideAction = (
  variables: Variable[],
  contentToEvaluate: string,
) => {
  const content = parseVariables(variables, { fieldToParse: 'id' })(contentToEvaluate)
  const args = extractVariablesFromText(variables)(contentToEvaluate).map((variable) => ({
    id: variable.id,
    value: parseGuessedValueType(variable.value),
  }))
  return {
    content,
    args,
  }
}
