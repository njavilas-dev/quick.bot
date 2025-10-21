import { safeStringify } from '@quickbot.io/lib/safeStringify'
import { isDefined } from '@quickbot.io/lib/utils'
import { Variable, VariableForTest } from '@quickbot.io/schemas'

export const convertVariablesForTestToVariables = (
  variablesForTest: VariableForTest[],
  variables: Variable[],
): Variable[] => {
  if (!variablesForTest) return []
  return [
    ...variables,
    ...variablesForTest
      .filter((v) => v.variableId)
      .map((variableForTest) => {
        const variable = variables.find((v) => v.id === variableForTest.variableId) as Variable
        return { ...variable, value: parseVariableValue(variableForTest.value) }
      }, {}),
  ].filter((v) => v.value)
}

const parseVariableValue = (value: string | undefined): string | string[] => {
  if (!value) return ''
  try {
    const parsedValue = JSON.parse(value)
    if (Array.isArray(parsedValue)) return parsedValue.map(safeStringify).filter(isDefined)
    return safeStringify(parsedValue) ?? value
  } catch (error) {
    console.error(error)
    return value
  }
}
