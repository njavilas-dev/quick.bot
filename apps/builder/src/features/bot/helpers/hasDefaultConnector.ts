import { isDefined } from '@quickbot.io/lib'
import { isChoiceInput, isConditionBlock } from '@quickbot.io/schemas/helpers'
import { BlockV6 } from '@quickbot.io/schemas'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'

export const hasDefaultConnector = (block: BlockV6) =>
  (!isChoiceInput(block) &&
    !isConditionBlock(block) &&
    block.type !== LogicBlockType.AB_TEST) ||
  (block.type === InputBlockType.CHOICE && isDefined(block.options?.dynamicVariableId))
