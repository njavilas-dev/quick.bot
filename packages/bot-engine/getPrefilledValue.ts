import { isDefined } from '@quickbot.io/lib/utils'
import { InputBlock } from '@quickbot.io/schemas'
import { Variable } from '@quickbot.io/schemas/features/bot/variable'

export const getPrefilledInputValue = (variables: Variable[]) => (block: InputBlock) => {
  const variableValue = variables.find(
    (variable) => variable.id === block.options?.variableId && isDefined(variable.value),
  )?.value
  if (!variableValue || Array.isArray(variableValue)) return
  return variableValue
}
