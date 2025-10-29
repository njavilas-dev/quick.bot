import { useMemo } from 'react'
import { BlockV6 } from '@quickbot.io/schemas'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import {
  validateIntegrationConfiguration,
  IntegrationValidationResult,
} from '../utils/validateIntegrationConfiguration'
import { useBot } from '@/features/editor/providers/BotProvider'

/**
 * Hook to validate integration block configuration and input blocks
 */
export const useIntegrationValidation = (block: BlockV6): IntegrationValidationResult => {
  const { bot } = useBot()

  return useMemo(() => {
    // For payment input blocks, validate credentials
    if (block.type === InputBlockType.PAYMENT) {
      const hasCredentialsError = !block.options?.credentialsId
      const hasRequiredFieldsError = !block.options?.amount

      // Validate variables for payment block
      const variablesValidation = validateIntegrationConfiguration(block, bot?.variables || [])
      const hasMissingVariablesError = variablesValidation.hasMissingVariablesError

      const errors: string[] = []
      if (hasCredentialsError) {
        errors.push('Stripe account required')
      }
      if (hasRequiredFieldsError) {
        errors.push('Amount required')
      }
      if (hasMissingVariablesError) {
        // Prefer structured errors when available
        const structured = variablesValidation.errorsDetailed?.filter(
          (e) => e.code === 'variableNotFound' || e.code === 'inlineVarNotFound',
        )
        if (structured && structured.length > 0) {
          errors.push(...structured.map((e) => e.message || 'Variable not found'))
        } else {
          errors.push(...variablesValidation.errors.filter((e) => e.includes('Variable not found')))
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        hasCredentialsError,
        hasRequiredFieldsError,
        hasMissingVariablesError,
      }
    }

    // For integration blocks and other blocks, use existing validation with variables
    return validateIntegrationConfiguration(block, bot?.variables || [])
  }, [block, bot?.variables])
}
