import { SetVariableBlock } from './schema'

export const valueTypes = [
  'Custom',
  'Empty',
  'Append value(s)',
  'Map item with same index',
  'Pop',
  'Shift',
] as const

export const hiddenTypes = ['User ID'] as const

export const sessionOnlySetVariableOptions = [] as const

export const defaultSetVariableOptions = {
  type: 'Custom',
  isExecutedOnClient: false,
  isCode: false,
} as const satisfies SetVariableBlock['options']
