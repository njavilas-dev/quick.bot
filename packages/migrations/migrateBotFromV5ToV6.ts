import {
  BlockV5,
  BlockV6,
  GoogleSheetsBlockV5,
  GoogleSheetsBlockV6,
  PublicBotV5,
  PublicBotV6,
  BotV5,
  BotV6,
} from '@quickbot.io/schemas'
import { IntegrationBlockType } from '@quickbot.io/schemas/features/blocks/integrations/constants'
import { GoogleSheetsAction } from '@quickbot.io/schemas/features/blocks/integrations/googleSheets/constants'
import { ComparisonOperators } from '@quickbot.io/schemas/features/blocks/logic/condition/constants'
import { createId } from '@quickbot.io/lib/createId'
import { EventType } from '@quickbot.io/schemas/features/events/constants'
import { byId } from '@quickbot.io/lib/utils'

export const migrateBotFromV5ToV6 = async (
  bot: BotV5 | PublicBotV5,
): Promise<BotV6 | PublicBotV6> => {
  const startGroup = bot.groups.find((group) => group.blocks.some((b) => b.type === 'start'))

  if (!startGroup) throw new Error('Start group not found')

  const startBlock = startGroup?.blocks.find((b) => b.type === 'start')

  if (!startBlock) throw new Error('Start block not found')

  const startOutgoingEdge = bot.edges.find(byId(startBlock.outgoingEdgeId))

  return {
    ...bot,
    groups: migrateGroups(bot.groups.filter((g) => g.blocks.some((b) => b.type !== 'start'))),
    version: '6',
    events: [
      {
        id: startGroup.id,
        type: EventType.START,
        graphCoordinates: startGroup.graphCoordinates,
        outgoingEdgeId: startBlock.outgoingEdgeId,
      },
    ],
    edges: startOutgoingEdge
      ? [
          {
            ...startOutgoingEdge,
            from: {
              eventId: startGroup.id,
            },
          },
          ...bot.edges.filter((e) => e.id !== startOutgoingEdge.id),
        ]
      : bot.edges,
  }
}

const migrateGroups = (groups: BotV5['groups']): BotV6['groups'] =>
  groups.map((group) => ({
    ...group,
    blocks: migrateBlocksFromV1ToV2(group.blocks),
  }))

const migrateBlocksFromV1ToV2 = (blocks: BotV5['groups'][0]['blocks']): BlockV6[] =>
  (blocks.filter((block) => block.type !== 'start') as Exclude<BlockV5, { type: 'start' }>[]).map(
    (block) => {
      if (block.type === IntegrationBlockType.GOOGLE_SHEETS) {
        return {
          ...block,
          options: migrateGoogleSheetsOptions(block.options),
        }
      }
      return block
    },
  )

const migrateGoogleSheetsOptions = (
  options: GoogleSheetsBlockV5['options'],
): GoogleSheetsBlockV6['options'] => {
  if (!options) return
  if (options.action === GoogleSheetsAction.GET) {
    if (options.filter || !options.referenceCell) return options
    return {
      ...options,
      filter: {
        comparisons: [
          {
            id: createId(),
            column: options.referenceCell?.column,
            comparisonOperator: ComparisonOperators.EQUAL,
            value: options.referenceCell?.value,
          },
        ],
      },
    }
  }
  if (options.action === GoogleSheetsAction.INSERT_ROW) {
    return options
  }
  if (options.action === GoogleSheetsAction.UPDATE_ROW) {
    if (options.filter || !options.referenceCell) return options
    return {
      ...options,
      filter: {
        comparisons: [
          {
            id: createId(),
            column: options.referenceCell?.column,
            comparisonOperator: ComparisonOperators.EQUAL,
            value: options.referenceCell?.value,
          },
        ],
      },
    }
  }
  return options
}
