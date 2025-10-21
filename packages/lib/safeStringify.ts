import { isNotDefined } from './utils'

export const safeStringify = (val: unknown): string | undefined => {
  if (isNotDefined(val))
    return
  if (typeof val === 'string')
    return val
  try {
    return JSON.stringify(val)
  } catch {
    console.warn('Failed to safely stringify variable value', val)
  }
}
