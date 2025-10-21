import { ChoiceInputBlock, SessionState } from '@quickbot.io/schemas'
import { injectVariableValuesInButtonsInputBlock } from './injectVariableValuesInButtonsInputBlock'
import { ParsedReply } from '../../../types'
import { FlowManager } from '../../../whatsapp/flows/FlowManager'

export const parseButtonsReply =
  (state: SessionState) =>
  (inputValue: string, block: ChoiceInputBlock): ParsedReply => {
    const displayedItems = injectVariableValuesInButtonsInputBlock(state)(block).items
    
    // Check if this might be a flow response (JSON format)
    if (inputValue.trim().startsWith('{') && inputValue.trim().endsWith('}')) {
      try {
        const flowResponse = FlowManager.parseFlowResponse(inputValue)
        if (flowResponse.selectedTitles && flowResponse.blockId === block.id) {
          return {
            status: 'success',
            reply: flowResponse.selectedTitles,
          }
        }
      } catch (error) {
        console.log('Not a valid flow response, continuing with regular parsing')
      }
    }
    
    if (block.options?.isMultipleChoice) {
      const longestItemsFirst = [...displayedItems].sort(
        (a, b) => (b.content?.length ?? 0) - (a.content?.length ?? 0),
      )
      const matchedItemsByContent = longestItemsFirst.reduce<{
        strippedInput: string
        matchedItemIds: string[]
      }>(
        (acc, item) => {
          if (
            item.content &&
            acc.strippedInput.toLowerCase().includes(item.content.trim().toLowerCase())
          )
            return {
              strippedInput: acc.strippedInput.replace(item.content ?? '', ''),
              matchedItemIds: [...acc.matchedItemIds, item.id],
            }
          return acc
        },
        {
          strippedInput: inputValue.trim(),
          matchedItemIds: [],
        },
      )
      const remainingItems = displayedItems.filter(
        (item) => !matchedItemsByContent.matchedItemIds.includes(item.id),
      )
      const matchedItemsByIndex = remainingItems.reduce<{
        strippedInput: string
        matchedItemIds: string[]
      }>(
        (acc, item, idx) => {
          if (acc.strippedInput.includes(`${idx + 1}`))
            return {
              strippedInput: acc.strippedInput.replace(`${idx + 1}`, ''),
              matchedItemIds: [...acc.matchedItemIds, item.id],
            }
          return acc
        },
        {
          strippedInput: matchedItemsByContent.strippedInput,
          matchedItemIds: [],
        },
      )
      const matchedItems = displayedItems.filter((item) =>
        [...matchedItemsByContent.matchedItemIds, ...matchedItemsByIndex.matchedItemIds].includes(
          item.id,
        ),
      )
      if (matchedItems.length > 0) {
        return {
          status: 'success',
          reply: matchedItems.map((item) => item.content).join(', '),
        }
      }

      if (matchedItems.length === 0 && block.options?.otherOption) {
        return { status: 'success', reply: inputValue, useDefault: true }
      }

      return { status: 'fail' }
    }
    const longestItemsFirst = [...displayedItems].sort(
      (a, b) => (b.content?.length ?? 0) - (a.content?.length ?? 0),
    )
    const matchedItem = longestItemsFirst.find(
      (item) =>
        item.id === inputValue ||
        (item.content && inputValue.trim() === item.content.trim()) ||
        ('value' in item && item.value === inputValue.trim()),
    )

    if (matchedItem) {
      return {
        status: 'success',
        reply: matchedItem.content ?? '',
        value: matchedItem.value,
      }
    }

    if (!matchedItem && block.options?.otherOption) {
      return { status: 'success', reply: inputValue, useDefault: true }
    }

    return { status: 'fail' }
  }
