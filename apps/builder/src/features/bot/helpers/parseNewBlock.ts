import { createId } from '@quickbot.io/lib/createId'
import { blockTypeHasItems } from '@quickbot.io/schemas/helpers'
import { BlockV6, BlockWithItems, ItemV6 } from '@quickbot.io/schemas'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'
import { getBlockTemplate } from './blockTemplates'
import { getDefaultOptionsForBlockType } from '@quickbot.io/schemas/features/blocks/helpers'

const parseDefaultItems = (type: BlockWithItems['type']): ItemV6[] => {
  switch (type) {
    case InputBlockType.CHOICE:
      return [{ id: createId() }]
    case LogicBlockType.CONDITION:
      return [
        {
          id: createId(),
        },
      ]
    case LogicBlockType.AB_TEST:
      return [
        {
          id: createId(),
          path: 'a',
        },
        {
          id: createId(),
          path: 'b',
        },
      ]
  }
}

export const parseNewBlock = (type: BlockV6['type']) => {
  const blockId = createId()
  const blockTemplate = getBlockTemplate(type)
  const defaultOptions = getDefaultOptionsForBlockType(type)

  return {
    id: blockId,
    type,
    ...(blockTypeHasItems(type) ? { items: parseDefaultItems(type) } : undefined),
    ...(defaultOptions ? { options: defaultOptions } : undefined),
    ...(blockTemplate?.template?.blocks || {}),
  } as BlockV6
}
