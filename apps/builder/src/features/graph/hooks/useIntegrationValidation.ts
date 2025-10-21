import { useMemo } from 'react'
import { BlockV6 } from '@quickbot.io/schemas'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import {
  validateIntegrationConfiguration,
  IntegrationValidationResult,
} from '../utils/validateIntegrationConfiguration'

/**
 * Hook to validate integration block configuration and input blocks
 */
export const useIntegrationValidation = (block: BlockV6): IntegrationValidationResult => {
  return useMemo(() => {
    // For payment input blocks, validate credentials
    if (block.type === InputBlockType.PAYMENT) {
      const hasCredentialsError = !block.options?.credentialsId
      const hasRequiredFieldsError = !block.options?.amount

      const errors: string[] = []
      if (hasCredentialsError) {
        errors.push('Stripe account required')
      }
      if (hasRequiredFieldsError) {
        errors.push('Amount required')
      }

      return {
        isValid: errors.length === 0,
        errors,
        hasCredentialsError,
        hasRequiredFieldsError,
      }
    }

    // For integration blocks, use existing validation
    return validateIntegrationConfiguration(block)
  }, [block])
}
