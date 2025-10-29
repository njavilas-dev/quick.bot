import { IntegrationValidationResult } from '@/features/graph/utils/validateIntegrationConfiguration'

export const useValidationColor = (
  validation: IntegrationValidationResult,
  okColor: string,
  errorColor: string,
) => {
  const hasError =
    validation.hasMissingVariablesError ||
    validation.hasCredentialsError ||
    validation.hasRequiredFieldsError
  return hasError ? errorColor : okColor
}
