import { PublicBotV6 } from '@quickbot.io/schemas'
import { isInputBlock } from '@quickbot.io/schemas/helpers'

export const parseBlockIdVariableIdMap = (
  groups?: PublicBotV6['groups'],
): {
  [key: string]: string
} => {
  if (!groups) return {}
  const blockIdVariableIdMap: { [key: string]: string } = {}
  groups.forEach((group) => {
    group.blocks.forEach((block) => {
      if (isInputBlock(block) && block.options?.variableId) {
        blockIdVariableIdMap[block.id] = block.options.variableId
      }
    })
  })
  return blockIdVariableIdMap
}
