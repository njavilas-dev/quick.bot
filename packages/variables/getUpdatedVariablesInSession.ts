import { safeStringify } from '@quickbot.io/lib/safeStringify'
import { Variable, VariableWithUnknowValue } from './types'
import { SessionState, SetVariableHistoryItem } from '@quickbot.io/schemas'
import { encryptForStorage } from './secretVariableHandler'

type Props = {
  state: SessionState
  newVariables: VariableWithUnknowValue[]
  currentBlockId: string | undefined
}
export const getUpdatedVariablesInSession = ({
  state,
  newVariables,
  currentBlockId,
}: Props): {
  updatedState: SessionState
  newSetVariableHistory: SetVariableHistoryItem[]
} => {
  const { updatedVariables, newSetVariableHistory, setVariableHistoryIndex } = updateBotVariables({
    state,
    newVariables,
    currentBlockId,
  })

  return {
    updatedState: {
      ...state,
      currentSetVariableHistoryIndex: setVariableHistoryIndex,
      botsQueue: state.botsQueue.map((botInQueue, index: number) =>
        index === 0
          ? {
            ...botInQueue,
            bot: {
              ...botInQueue.bot,
              variables: updatedVariables,
            },
          }
          : botInQueue,
      ),
      previewMetadata: state.botsQueue[0].resultId
        ? state.previewMetadata
        : {
          ...state.previewMetadata,
          setVariableHistory: (state.previewMetadata?.setVariableHistory ?? []).concat(
            newSetVariableHistory,
          ),
        },
    },
    newSetVariableHistory,
  }
}

const updateBotVariables = ({
  state,
  newVariables,
  currentBlockId,
}: {
  state: SessionState
  newVariables: VariableWithUnknowValue[]
  currentBlockId: string | undefined
}): {
  updatedVariables: Variable[]
  newSetVariableHistory: SetVariableHistoryItem[]
  setVariableHistoryIndex: number
} => {
  const serializedNewVariables = newVariables.map((variable) => {
    // Arrays: stringify each element
    if (Array.isArray(variable.value)) {
      const stringified = variable.value.map((v) => safeStringify(v) ?? '')
      return {
        ...variable,
        value: encryptForStorage(stringified, variable),
      }
    }

    // Secret variables are already strings and shouldn't be stringified
    // Non-secret variables need to be stringified first
    const preparedValue = variable?.isSecretVariable
      ? (variable.value as string)
      : (safeStringify(variable.value) ?? '')

    return {
      ...variable,
      value: encryptForStorage(preparedValue, variable),
    }
  })

  let setVariableHistoryIndex = state.currentSetVariableHistoryIndex ?? 0
  const setVariableHistory: SetVariableHistoryItem[] = []
  if (currentBlockId) {
    serializedNewVariables
      .filter((v) => state.setVariableIdsForHistory?.includes(v.id))
      .forEach((newVariable) => {
        setVariableHistory.push({
          resultId: state.botsQueue[0].resultId as string,
          index: setVariableHistoryIndex,
          blockId: currentBlockId,
          variableId: newVariable.id,
          value: newVariable.value,
        })
        setVariableHistoryIndex += 1
      })
  }

  return {
    updatedVariables: [
      ...state.botsQueue[0].bot.variables.filter((existingVariable) =>
        serializedNewVariables.every((newVariable) => existingVariable.id !== newVariable.id),
      ),
      ...serializedNewVariables,
    ],
    newSetVariableHistory: setVariableHistory,
    setVariableHistoryIndex,
  }
}
