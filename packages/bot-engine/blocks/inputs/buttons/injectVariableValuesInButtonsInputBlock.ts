import { SessionState, VariableWithValue, ChoiceInputBlock } from '@quickbot.io/schemas'
import { isDefined } from '@quickbot.io/lib'
import { filterChoiceItems } from './filterChoiceItems'
import { deepParseVariables } from '@quickbot.io/variables/deepParseVariables'
import { transformVariablesToList } from '@quickbot.io/variables/transformVariablesToList'

export const injectVariableValuesInButtonsInputBlock =
  (state: SessionState) =>
  (block: ChoiceInputBlock): ChoiceInputBlock => {
    const { variables } = state.botsQueue[0].bot
    if (block.options?.dynamicVariableId) {
      const variable = variables.find(
        (variable) => variable.id === block.options?.dynamicVariableId && isDefined(variable.value),
      ) as VariableWithValue | undefined
      if (!variable) return block
      const value = getVariableValue(state)(variable)
      return {
        ...deepParseVariables(variables)(block),
        items: value.filter(isDefined).map((item, idx) => {
          const itemObject = JSON.parse(item as string)
          if (typeof itemObject === 'object') {
            return {
              id: 'choice' + idx.toString(),
              blockId: block.id,
              pictureSrc: itemObject.pictureSrc,
              description: itemObject.description,
              content: itemObject.title || itemObject.value,
              title: itemObject.title,
              value: itemObject.value,
            }
          }
          return {
            id: 'choice' + idx.toString(),
            blockId: block.id,
            content: item as string,
          }
        }),
      }
    }
    return deepParseVariables(variables)(filterChoiceItems(variables)(block))
  }

const getVariableValue =
  (state: SessionState) =>
  (variable: VariableWithValue): (string | { value: string; title: string } | null)[] => {
    if (!Array.isArray(variable.value)) {
      const { variables } = state.botsQueue[0].bot
      const [transformedVariable] = transformVariablesToList(variables)([variable.id])
      return transformedVariable.value as (string | { value: string; title: string })[]
    }
    return variable.value
  }
