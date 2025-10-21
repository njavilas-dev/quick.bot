import { BlockV6 } from '@quickbot.io/schemas'
import { IntegrationBlockType } from '@quickbot.io/schemas/features/blocks/integrations/constants'
import { forgedBlocks } from '@quickbot.io/forge-repository/definitions'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface IntegrationValidationResult extends ValidationResult {
  hasCredentialsError: boolean
  hasRequiredFieldsError: boolean
}

/**
 * Validates integration block configuration including credentials and required fields
 */
export const validateIntegrationConfiguration = (block: BlockV6): IntegrationValidationResult => {
  const isForgedBlock = block.type in forgedBlocks
  const isNativeIntegration = Object.values(IntegrationBlockType).includes(
    block.type as IntegrationBlockType,
  )

  const isIntegration = isForgedBlock || isNativeIntegration

  if (!isIntegration) {
    return {
      isValid: true,
      errors: [],
      hasCredentialsError: false,
      hasRequiredFieldsError: false,
    }
  }

  const errors: string[] = []
  let hasCredentialsError = false
  let hasRequiredFieldsError = false

  // Validate credentials for forged blocks
  if (isForgedBlock) {
    const blockDef = forgedBlocks[block.type as keyof typeof forgedBlocks]
    // @ts-expect-error - BlockV6 type doesn't guarantee options property exists
    if (blockDef?.auth && !block.options?.credentialsId) {
      errors.push('Invalid credentials')
      hasCredentialsError = true
    }
  }

  // Validate credentials for built-in integrations
  const credentialsValidation = validateCredentials(block)
  if (!credentialsValidation.isValid) {
    errors.push(...credentialsValidation.errors)
    hasCredentialsError = true
  }

  // Validate required fields based on block type
  const requiredFieldsValidation = validateRequiredFields(block)
  if (!requiredFieldsValidation.isValid) {
    errors.push(...requiredFieldsValidation.errors)
    hasRequiredFieldsError = true
  }

  const result = {
    isValid: errors.length === 0,
    errors,
    hasCredentialsError,
    hasRequiredFieldsError,
  }

  return result
}

/**
 * Validates credentials for different integration types
 */
const validateCredentials = (block: BlockV6): ValidationResult => {
  const errors: string[] = []

  switch (block.type) {
    case IntegrationBlockType.EMAIL:
      if (!block.options?.credentialsId) {
        errors.push('SMTP credentials required')
      }
      break

    case IntegrationBlockType.GOOGLE_SHEETS:
      if (!block.options?.credentialsId) {
        errors.push('Google Sheets credentials required')
      }
      break

    case IntegrationBlockType.GOOGLE_ANALYTICS:
      if (!block.options?.trackingId) {
        errors.push('Measurement ID required')
      }
      break

    case IntegrationBlockType.CHATWOOT:
      if (!block.options?.baseUrl || !block.options?.websiteToken) {
        errors.push('Chatwoot credentials required')
      }
      break

    default:
      break
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validates required fields for different integration types
 */
const validateRequiredFields = (block: BlockV6): ValidationResult => {
  const errors: string[] = []

  switch (block.type) {
    case IntegrationBlockType.EMAIL:
      if (!block.options?.recipients || block.options.recipients.length === 0) {
        errors.push('Recipients required')
      }
      if (!block.options?.subject) {
        errors.push('Subject required')
      }
      break

    case IntegrationBlockType.GOOGLE_SHEETS:
      if (!block.options?.spreadsheetId) {
        errors.push('Spreadsheet ID required')
      }
      break

    case IntegrationBlockType.WEBHOOK:
      if (!block.options?.webhook?.url) {
        errors.push('Webhook URL required')
      }
      break

    case IntegrationBlockType.ZAPIER:
    case IntegrationBlockType.MAKE_COM:
    case IntegrationBlockType.PABBLY_CONNECT:
      if (!block.options?.webhook?.url) {
        errors.push('Webhook URL required')
      }
      break

    case IntegrationBlockType.CHATWOOT:
      // Credentials are validated in validateCredentials function
      break

    case IntegrationBlockType.PIXEL:
      if (!block.options?.pixelId) {
        errors.push('Pixel ID required')
      }
      break

    default:
      // For forged blocks, validate based on action definition
      if (block.type in forgedBlocks) {
        const blockDef = forgedBlocks[block.type as keyof typeof forgedBlocks]
        // @ts-expect-error - BlockV6 type doesn't guarantee options property exists
        const actionDef = blockDef?.actions.find((a) => a.name === block.options?.action)

        // Only validate required fields if an action is selected
        // @ts-expect-error - BlockV6 type doesn't guarantee options property exists
        if (actionDef?.options && block.options?.action) {
          const requiredFields = getRequiredFieldsFromSchema(actionDef.options)

          for (const field of requiredFields) {
            // @ts-expect-error - BlockV6 type doesn't guarantee options property exists
            const fieldValue = block.options?.[field]

            if (isFieldEmpty(fieldValue)) {
              errors.push(`Wrong configuration: ${field} is required`)
            }
          }
        }
      }
      break
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Extracts required fields from a Zod schema
 */
const getRequiredFieldsFromSchema = (schema: unknown): string[] => {
  const requiredFields: string[] = []
  try {
    if (schema && typeof schema === 'object' && 'shape' in schema) {
      const shape = (schema as { shape: Record<string, unknown> }).shape
      Object.entries(shape).forEach(([key, value]) => {
        // For forged blocks, we need to check the layout configuration in _def.layout
        if (value && typeof value === 'object' && '_def' in value) {
          const def = (value as { _def: { layout?: { isRequired?: boolean } } })._def
          const layout = def.layout

          if (layout && typeof layout === 'object' && layout.isRequired === true) {
            requiredFields.push(key)
          }
        } else {
          // Fallback to Zod schema validation
          if (
            value &&
            typeof value === 'object' &&
            '_def' in value &&
            value._def &&
            typeof value._def === 'object' &&
            'typeName' in value._def
          ) {
            const typeName = (value._def as { typeName: string }).typeName

            if (typeName === 'ZodOptional' || typeName === 'ZodDefault') {
              // Field is optional or has default value
            } else {
              requiredFields.push(key)
            }
          } else {
            requiredFields.push(key)
          }
        }
      })
    }
  } catch (error) {
    // If schema parsing fails, return empty array
    console.warn('Could not parse schema for required fields validation:', error)
  }

  return requiredFields
}

/**
 * Checks if a field value is empty or invalid
 */
const isFieldEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') {
    return value.trim().length === 0
  }
  if (Array.isArray(value)) {
    return value.length === 0
  }
  if (typeof value === 'object') {
    return Object.keys(value).length === 0
  }
  return false
}
