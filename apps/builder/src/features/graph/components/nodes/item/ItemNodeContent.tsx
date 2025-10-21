import { ButtonsBubbleItemNode } from '@/features/blocks/inputs/buttons/components/ButtonsBubbleItemNode'
import { ConditionItemNode } from '@/features/blocks/logic/condition/components/ConditionItemNode'
import { BlockWithItems, ButtonItem, ConditionItem, Item, ItemIndices } from '@quickbot.io/schemas'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'
import React from 'react'

type Props = {
  item: Item
  blockType: BlockWithItems['type']
  indices: ItemIndices
}

export const ItemNodeContent = ({ item, blockType, indices }: Props): JSX.Element => {
  switch (blockType) {
    case InputBlockType.CHOICE:
      return (
        <ButtonsBubbleItemNode
          key={`${item.id}-${(item as ButtonItem).content}`}
          item={item as ButtonItem}
          indices={indices}
        />
      )
    case LogicBlockType.CONDITION:
      return <ConditionItemNode item={item as ConditionItem} indices={indices} />
    case LogicBlockType.AB_TEST:
      return <></>
  }
}
