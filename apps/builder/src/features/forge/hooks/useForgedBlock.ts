import { useMemo } from 'react'
import { forgedBlocks } from '@quickbot.io/forge-repository/definitions'
import { forgedBlockSchemas } from '@quickbot.io/forge-repository/schemas'
import { BlockV6 } from '@quickbot.io/schemas'
import { isForgedBlockType } from '@quickbot.io/schemas/features/blocks/forged/helpers'

// Extract default values from Zod schema options
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractDefaultValues = (options: any): Record<string, any> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const defaults: Record<string, any> = {}
  if (!options || typeof options !== 'object') return defaults
  if (options._def?.shape) {
    const shape =
      typeof options._def.shape === 'function' ? options._def.shape() : options._def.shape
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.entries(shape).forEach(([key, option]: [string, any]) => {
      if (option?._def?.layout?.defaultValue !== undefined) {
        defaults[key] = option._def.layout.defaultValue
      }
    })
  }
  return defaults
}

// Hook to get forged block definition, schema, and action defaults
export const useForgedBlock = (blockType: BlockV6['type'], action?: string) =>
  useMemo(() => {
    if (!isForgedBlockType(blockType)) return {}
    const blockDef = forgedBlocks[blockType]
    const actionDef = action ? blockDef?.actions.find((a) => a.name === action) : undefined
    const actionDefaults = actionDef ? extractDefaultValues(actionDef.options) : {}
    return {
      blockDef,
      blockSchema: forgedBlockSchemas[blockType],
      actionDef,
      actionDefaults,
    }
  }, [action, blockType])
