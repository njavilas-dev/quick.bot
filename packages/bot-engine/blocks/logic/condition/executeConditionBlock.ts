import { ConditionBlock, SessionState } from '@quickbot.io/schemas'
import { ExecuteLogicResponse } from '../../../types'
import { executeCondition } from '@quickbot.io/logic/executeCondition'
export const executeConditionBlock = (
  state: SessionState,
  block: ConditionBlock,
): ExecuteLogicResponse => {
  const { variables } = state.botsQueue[0].bot
  const passedCondition = block.items.find(
    (item) => item.content && executeCondition({ variables, condition: item.content }),
  )
  return {
    outgoingEdgeId: passedCondition ? passedCondition.outgoingEdgeId : block.outgoingEdgeId,
  }
}
