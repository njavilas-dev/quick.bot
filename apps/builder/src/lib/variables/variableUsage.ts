import { Bot } from '@quickbot.io/schemas'
import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'

export const USED_VARIABLE_OPACITY = '1'
export const UNUSED_VARIABLE_OPACITY = '0.4'

const VARIABLE_ID_IN_STRING_REGEX = /{{([a-zA-Z0-9-\s]+)}}/g

export const extractVariableIdsFromString = (str: string): string[] => {
  if (!str) return []
  const matches = str.match(VARIABLE_ID_IN_STRING_REGEX)
  if (!matches) return []
  return matches.map((match) => match.replace(/{{|}}/g, ''))
}
/* eslint-disable @typescript-eslint/no-explicit-any */
const extractVariableIdsFromRichText = (nodes: any[], bot: Bot): string[] => {
  let ids: string[] = []
  if (!nodes) return ids
  for (const node of nodes) {
    if (node.text) {
      const variableNames = extractVariableIdsFromString(node.text)
      // Convert variable names to actual IDs
      const variableIds = variableNames
        .map((name) => {
          const variable = bot.variables.find((v) => v.name === name)
          return variable ? variable.id : null
        })
        .filter((id): id is string => id !== null)
      ids = [...ids, ...variableIds]
    }
    if (node.children) {
      ids = [...ids, ...extractVariableIdsFromRichText(node.children, bot)]
    }
  }

  return ids
}

type VariableUsage = {
  usedVariableIds: Set<string>
  variableUsageMap: Map<string, { blockId: string; blockName: string }[]>
}

export const analyzeVariableUsage = (bot: Bot): VariableUsage => {
  const usedVariableIds = new Set<string>()
  const variableUsageMap = new Map<string, { blockId: string; blockName: string }[]>()

  const addUsage = (variableId: string, block: { id: string; name?: string }) => {
    if (!variableId) return
    usedVariableIds.add(variableId)
    const existingUsages = variableUsageMap.get(variableId) ?? []
    if (existingUsages.every((usage) => usage.blockId !== block.id)) {
      variableUsageMap.set(variableId, [
        ...existingUsages,
        { blockId: block.id, blockName: block.name ?? 'Start' },
      ])
    }
  }

  const inspectString = (str: string | undefined | null, block: { id: string; name?: string }) => {
    if (!str) return
    const variableNames = extractVariableIdsFromString(str)
    // Convert variable names to actual IDs
    const variableIds = variableNames
      .map((name) => {
        const variable = bot.variables.find((v) => v.name === name)
        return variable ? variable.id : null
      })
      .filter((id): id is string => id !== null)
    variableIds.forEach((id) => addUsage(id, block))
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const inspectRichText = (richText: any[] | undefined, block: { id: string; name?: string }) => {
    if (!richText) return
    const variableIds = extractVariableIdsFromRichText(richText, bot)
    variableIds.forEach((id) => addUsage(id, block))
  }

  bot.groups.forEach((group) => {
    group.blocks.forEach((block) => {
      const blockInfo = { id: block.id, name: 'name' in block ? (block.name as string) : 'Start' }

      if (block.type === BubbleBlockType.TEXT && block.content?.richText) {
        inspectRichText(block.content.richText, blockInfo)
      }

      if ('options' in block && block.options) {
        const { options } = block
        if ('content' in options && typeof options.content === 'string') {
          inspectString(options.content, blockInfo)
        }
        if ('url' in options && typeof options.url === 'string') {
          inspectString(options.url, blockInfo)
        }
        if ('variableId' in options && typeof options.variableId === 'string') {
          addUsage(options.variableId, blockInfo)
        }
        if ('expression' in options && options.expression) {
          inspectString(options.expression.value, blockInfo)
        }
        if ('expressions' in options && options.expressions) {
          /* eslint-disable @typescript-eslint/no-explicit-any */
          options.expressions.forEach((exp: any) => inspectString(exp.value, blockInfo))
        }
        if ('value' in options && typeof options.value === 'string') {
          inspectString(options.value, blockInfo)
        }
      }

      if ('items' in block && block.items) {
        block.items.forEach((item) => {
          if ('title' in item) inspectString(item.title, blockInfo)
          if ('description' in item) inspectString(item.description, blockInfo)
          if ('variableId' in item && item.variableId) {
            addUsage(item.variableId as string, blockInfo)
          }
          // Check for condition block comparisons
          if ('content' in item && item.content && typeof item.content === 'object') {
            const content = item.content as any
            if ('comparisons' in content && Array.isArray(content.comparisons)) {
              content.comparisons.forEach((comparison: any) => {
                if (comparison.variableId) {
                  addUsage(comparison.variableId, blockInfo)
                }
                // Also check the value field for variable references
                if (comparison.value) {
                  inspectString(comparison.value, blockInfo)
                }
              })
            }
          }
        })
      }
    })
  })

  return { usedVariableIds, variableUsageMap }
}
