import { Variable } from './types'
import { secureVariable } from './secureVariable'

/**
 * Determines if code is running on client or server
 */
const isServer = (): boolean => typeof window === 'undefined'

/**
 * Type guard to check if a variable is secret
 */
const isSecretVariable = <T extends { isSecretVariable?: boolean }>(
  variable?: T,
): variable is T & { isSecretVariable: true } =>
  Boolean(variable?.isSecretVariable)

/**
 * Display value handler - always masks secret variables
 * Used for: UI, responses, chat bubbles
 *
 * @example
 * getDisplayValue('password123', secretVar) // '●●●●●●●●●●●'
 * getDisplayValue('normal', regularVar)    // 'normal'
 */
export const getDisplayValue = (
  value?: string,
  variable?: Pick<Variable, 'isSecretVariable'>,
): string => {
  if (!value) return value ?? ''
  if (!isSecretVariable(variable)) return value
  return '●'.repeat(value.length)
}

/**
 * Processing value handler - decrypts on server, masks on client
 * Used for: webhooks, conditions, variable parsing in templates
 *
 * @example
 * // Server side:
 * getProcessingValue(encrypted, secretVar) // 'decrypted_value'
 *
 * // Client side:
 * getProcessingValue(encrypted, secretVar) // '●●●●●●●●'
 */
export const getProcessingValue = (
  value?: string,
  variable?: Pick<Variable, 'isSecretVariable' | 'name'>,
): string => {
  if (!value) return ''
  if (!isSecretVariable(variable)) return value

  const mask = '●'.repeat(value.length)

  if (!isServer()) {
    console.log(`🔒 Secret variable "${variable.name}" masked on client`)
    return mask
  }

  try {
    const decrypted = secureVariable.decrypt(value)
    console.log(`🔓 Secret variable "${variable.name}" decrypted on server`)
    return decrypted
  } catch (error) {
    console.error(`❌ Failed to decrypt variable "${variable.name}":`, error)
    return mask
  }
}

/**
 * Storage encryption handler - encrypts before saving to database
 * Used for: saving variables to session state
 *
 * @example
 * encryptForStorage('password123', secretVar)  // 'xY8aB...' (encrypted)
 * encryptForStorage('normal', regularVar)      // 'normal'
 * encryptForStorage(['a', 'b'], regularVar)    // ['a', 'b'] (arrays pass through)
 */
export const encryptForStorage = (
  value?: string | string[],
  variable?: Pick<Variable, 'isSecretVariable'>,
): string | string[] => {
  if (Array.isArray(value)) return value
  if (!value) return ''
  if (!isSecretVariable(variable)) return value

  if (!isServer()) {
    throw new Error('Cannot encrypt on client side')
  }

  return secureVariable.encrypt(value)
}
