import { useMemo } from 'react'
import { Condition, Variable } from '@quickbot.io/schemas'
import { isNotDefined } from '@quickbot.io/lib'
import { ComparisonOperators } from '@quickbot.io/schemas/features/blocks/logic/condition/constants'

export interface ConditionValidationResult {
  hasError: boolean
  invalidComparisonIds: string[]
}

/**
 * Hook to validate condition comparisons
 * Returns true if any comparison has an undefined or non-existent variable or missing required value
 */
export const useConditionValidation = (
  condition: Condition | undefined,
  variables: Variable[],
): ConditionValidationResult => {
  return useMemo(() => {
    if (!condition?.comparisons || condition.comparisons.length === 0) {
      return {
        hasError: false,
        invalidComparisonIds: [],
      }
    }

    const invalidComparisonIds: string[] = []

    // Check each comparison for undefined or non-existent variables
    for (const comparison of condition.comparisons) {
      // Skip validation if comparison is completely empty
      if (
        isNotDefined(comparison.comparisonOperator) &&
        isNotDefined(comparison.value) &&
        isNotDefined(comparison.variableId)
      ) {
        continue
      }

      let hasError = false

      // Check if variableId is undefined or if the variable doesn't exist
      const hasUndefinedVariable = isNotDefined(comparison.variableId)
      const variableExists = variables.some((v) => v.id === comparison.variableId)

      if (hasUndefinedVariable || !variableExists) {
        hasError = true
      }

      // Check if operator is undefined
      if (isNotDefined(comparison.comparisonOperator)) {
        hasError = true
      }

      // Check if value is required but missing
      const operatorRequiresValue =
        comparison.comparisonOperator !== ComparisonOperators.IS_SET &&
        comparison.comparisonOperator !== ComparisonOperators.IS_EMPTY

      if (
        operatorRequiresValue &&
        comparison.comparisonOperator &&
        (isNotDefined(comparison.value) || comparison.value.trim() === '')
      ) {
        hasError = true
      }

      if (hasError) {
        invalidComparisonIds.push(comparison.id)
      }
    }

    return {
      hasError: invalidComparisonIds.length > 0,
      invalidComparisonIds,
    }
  }, [condition, variables])
}
