import { BlockV6, Variable } from '@quickbot.io/schemas'
import { systemVariables } from '@quickbot.io/variables/system-variables'
import { isBubbleBlock } from '@quickbot.io/schemas/helpers'
import { IntegrationBlockType } from '@quickbot.io/schemas/features/blocks/integrations/constants'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'
import { forgedBlocks } from '@quickbot.io/forge-repository/definitions'
import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface IntegrationValidationResult extends ValidationResult {
  hasCredentialsError: boolean
  hasRequiredFieldsError: boolean
  hasMissingVariablesError: boolean
  // Backwards-compatible extension: structured errors alongside strings
  errorsDetailed?: ValidationError[]
}

export type ValidationErrorCode =
  | 'inlineVarNotFound'
  | 'variableNotFound'
  | 'credentialsMissing'
  | 'requiredFieldMissing'
  | 'invalidConfiguration'

export interface ValidationError {
  code: ValidationErrorCode
  // Optional path or field name that failed (when available)
  path?: string
  // Optional human message (UI may override)
  message?: string
}

/**
 * Validates integration block configuration including credentials and required fields
 */
export const validateIntegrationConfiguration = (
  block: BlockV6,
  variables?: Variable[],
): IntegrationValidationResult => {
  const isForgedBlock = block.type in forgedBlocks
  const isNativeIntegration = Object.values(IntegrationBlockType).includes(
    block.type as IntegrationBlockType,
  )

  const isIntegration = isForgedBlock || isNativeIntegration
  const isInputBlock = Object.values(InputBlockType).includes(block.type as InputBlockType)
  const isBubble = isBubbleBlock(block)
  const isLogicBlock = Object.values(LogicBlockType).includes(block.type as LogicBlockType)

  // If it's neither an integration, nor an input block, nor a bubble block, nor a logic block, skip validation
  if (!isIntegration && !isInputBlock && !isBubble && !isLogicBlock) {
    return {
      isValid: true,
      errors: [],
      hasCredentialsError: false,
      hasRequiredFieldsError: false,
      hasMissingVariablesError: false,
    }
  }

  const errors: string[] = []
  const errorsDetailed: ValidationError[] = []
  let hasCredentialsError = false
  let hasRequiredFieldsError = false
  let hasMissingVariablesError = false

  // Validate missing variables
  const variablesValidation = validateMissingVariables(block, variables || [])
  if (!variablesValidation.isValid) {
    errors.push(...variablesValidation.errors)
    // Map plain strings to structured errors conservatively
    for (const err of variablesValidation.errors) {
      if (err.startsWith('Rendered variable not found')) {
        errorsDetailed.push({ code: 'inlineVarNotFound', message: err })
      } else {
        errorsDetailed.push({ code: 'variableNotFound', message: err })
      }
    }
    hasMissingVariablesError = true
  }

  // Validate credentials for forged blocks (skip for bubble and logic blocks)
  if (isForgedBlock && !isBubble && !isLogicBlock) {
    const blockDef = forgedBlocks[block.type as keyof typeof forgedBlocks]
    if (blockDef?.auth && !block.options?.credentialsId) {
      errors.push('Invalid credentials')
      errorsDetailed.push({ code: 'credentialsMissing', message: 'Invalid credentials' })
      hasCredentialsError = true
    }
  }

  // Validate credentials for built-in integrations (skip for bubble and logic blocks)
  if (!isBubble && !isLogicBlock) {
    const credentialsValidation = validateCredentials(block)
    if (!credentialsValidation.isValid) {
      errors.push(...credentialsValidation.errors)
      for (const err of credentialsValidation.errors) {
        errorsDetailed.push({ code: 'credentialsMissing', message: err })
      }
      hasCredentialsError = true
    }
  }

  // Validate required fields based on block type (skip for bubble and logic blocks)
  if (!isBubble && !isLogicBlock) {
    const requiredFieldsValidation = validateRequiredFields(block)
    if (!requiredFieldsValidation.isValid) {
      errors.push(...requiredFieldsValidation.errors)
      for (const err of requiredFieldsValidation.errors) {
        if (err.endsWith('required')) {
          errorsDetailed.push({ code: 'requiredFieldMissing', message: err })
        } else {
          errorsDetailed.push({ code: 'invalidConfiguration', message: err })
        }
      }
      hasRequiredFieldsError = true
    }
  }

  // Validate inline variables in text inputs (placeholder/button)
  const inlineVarsValidation = validateInlineVariables(block, variables || [])
  if (!inlineVarsValidation.isValid) {
    errors.push(...inlineVarsValidation.errors)
    for (const err of inlineVarsValidation.errors) {
      errorsDetailed.push({ code: 'inlineVarNotFound', message: err })
    }
    hasMissingVariablesError = true
  }

  const result = {
    isValid: errors.length === 0,
    errors,
    errorsDetailed,
    hasCredentialsError,
    hasRequiredFieldsError,
    hasMissingVariablesError,
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

/**
 * Validates that all Selected variables exist in the bot
 */
const validateMissingVariables = (block: BlockV6, variables: Variable[]): ValidationResult => {
  const errors: string[] = []
  const variableIds = variables.map((v) => v.id)

  // Check for missing variables in different block types
  switch (block.type) {
    case InputBlockType.TEXT:
      // Check main variableId
      if (block.options?.variableId && !variableIds.includes(block.options.variableId)) {
        errors.push('Selected variable not found')
      }
      // Check attachment variable
      if (
        block.options?.attachments?.saveVariableId &&
        !variableIds.includes(block.options.attachments.saveVariableId)
      ) {
        errors.push('Selected variable not found')
      }
      // Check audio clip variable
      if (
        block.options?.audioClip?.saveVariableId &&
        !variableIds.includes(block.options.audioClip.saveVariableId)
      ) {
        errors.push('Selected variable not found')
      }
      break

    case InputBlockType.EMAIL:
    case InputBlockType.URL:
    case InputBlockType.PHONE:
    case InputBlockType.NUMBER:
    case InputBlockType.DATE:
    case InputBlockType.RATING:
    case InputBlockType.FILE:
      // Check main variableId
      if (block.options?.variableId && !variableIds.includes(block.options.variableId)) {
        errors.push('Selected variable not found')
      }
      break

    case InputBlockType.CHOICE: {
      const choiceOptions = ((block as unknown as { options?: unknown }).options || undefined) as
        | { variableId?: string; dynamicVariableId?: string }
        | undefined
      if (choiceOptions?.variableId && !variableIds.includes(choiceOptions.variableId)) {
        errors.push('Selected variable not found')
      }
      if (
        choiceOptions?.dynamicVariableId &&
        !variableIds.includes(choiceOptions.dynamicVariableId)
      ) {
        errors.push('Selected variable not found')
      }
      break
    }

    default:
      // For EMBED bubble blocks, validate saveDataInVariableId inside content.waitForEvent
      if (block.type === BubbleBlockType.EMBED) {
        const content = (block as unknown as { content?: unknown }).content as
          | { waitForEvent?: { isEnabled?: boolean; saveDataInVariableId?: string } }
          | undefined
        const saveId = content?.waitForEvent?.saveDataInVariableId
        if (content?.waitForEvent?.isEnabled && saveId && !variableIds.includes(saveId)) {
          errors.push('Selected variable not found')
        }
      }

      // For CONDITION logic blocks, validate variableId in comparisons
      if (block.type === LogicBlockType.CONDITION) {
        const options = (block as unknown as { options?: unknown }).options as
          | { comparisons?: { variableId?: string }[] }
          | undefined
        if (options?.comparisons) {
          for (const comparison of options.comparisons) {
            if (comparison.variableId && !variableIds.includes(comparison.variableId)) {
              errors.push('Selected variable not found')
            }
          }
        }
      }

      // For SET_VARIABLE logic blocks, validate variableId and other variable references
      if (block.type === LogicBlockType.SET_VARIABLE) {
        const options = (block as unknown as { options?: unknown }).options as
          | {
            variableId?: string
            mapListItemParams?: {
              baseItemVariableId?: string
              baseListVariableId?: string
              targetListVariableId?: string
            }
            saveItemInVariableId?: string
          }
          | undefined

        // Check main variableId
        if (options?.variableId && !variableIds.includes(options.variableId)) {
          errors.push('Selected variable not found')
        }

        // Check map list item params
        if (options?.mapListItemParams) {
          const { baseItemVariableId, baseListVariableId, targetListVariableId } =
            options.mapListItemParams
          if (baseItemVariableId && !variableIds.includes(baseItemVariableId)) {
            errors.push('Selected variable not found')
          }
          if (baseListVariableId && !variableIds.includes(baseListVariableId)) {
            errors.push('Selected variable not found')
          }
          if (targetListVariableId && !variableIds.includes(targetListVariableId)) {
            errors.push('Selected variable not found')
          }
        }

        // Check saveItemInVariableId (for Pop/Shift operations)
        if (options?.saveItemInVariableId && !variableIds.includes(options.saveItemInVariableId)) {
          errors.push('Selected variable not found')
        }
      }

      // For any other block shape, do a safe check only if options with variableId exist
      if (
        typeof block === 'object' &&
        block !== null &&
        'options' in (block as unknown as Record<string, unknown>)
      ) {
        const anyOptions = (block as unknown as { options?: unknown }).options as
          | { variableId?: string }
          | undefined
        if (anyOptions?.variableId && !variableIds.includes(anyOptions.variableId)) {
          errors.push('Selected variable not found')
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
 * Validates inline variable references like {{variableName}} inside text fields
 * Currently supports Text Input block: labels.placeholder, labels.button
 */
const validateInlineVariables = (block: BlockV6, variables: Variable[]): ValidationResult => {
  const errors: string[] = []

  // Merge bot variables and system variables by name
  const allVariableNames = new Set<string>([
    ...variables.map((v) => v.name),
    ...systemVariables.map((v) => v.name),
  ])

  const extractInlineVariables = (text?: string): string[] => {
    if (!text) return []
    const matches = text.match(/\{\{\s*([^}]+?)\s*\}\}/g) || []
    return matches.map((m) => m.replace(/\{\{|\}\}/g, '').trim()).filter((name) => name.length > 0)
  }

  // Recursively scan block.options strings (and arrays of strings) for inline variables automatically
  const scanValue = (val: unknown) => {
    if (typeof val === 'string') {
      for (const vName of extractInlineVariables(val)) {
        if (!allVariableNames.has(vName)) {
          errors.push(`Rendered variable not found`)
        }
      }
      return
    }
    if (Array.isArray(val)) {
      for (const item of val) scanValue(item)
      return
    }
    if (val && typeof val === 'object') {
      const obj = val as Record<string, unknown>
      for (const key of Object.keys(obj)) scanValue(obj[key])
    }
  }

  // Scan options if present (inputs and some integrations use options)
  // @ts-expect-error - options may not exist on all block types
  if (block.options) scanValue(block.options)

  // Additionally, scan content for bubble blocks (text/image/video/embed/audio)
  if (isBubbleBlock(block)) {
    // content can be optional; check existence safely
    if ((block as unknown as { content?: unknown }).content) {
      scanValue((block as unknown as { content?: unknown }).content)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
