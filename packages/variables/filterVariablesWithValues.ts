import { isDefined } from '@quickbot.io/lib'
import { Variable, VariableWithValue } from '../schemas'

export const filterSavedVariablesWithValues = (variables: Variable[]): VariableWithValue[] =>
  variables.filter(
    (variable) =>
      isDefined(variable.value) &&
      (variable.isSavedVariable === true ||
        variable.isSecretVariable === true ||
        variable.isSystemVariable === true), // System variables are always saved when they have a value
  ) as VariableWithValue[]
