import {
  InputBlock,
  PublicBot,
  ResultHeaderCell,
  Block,
  Bot,
  BotLinkBlock,
  Variable,
} from '@quickbot.io/schemas'
import { byId, isNotDefined } from '@quickbot.io/lib'
import { isInputBlock } from '@quickbot.io/schemas/helpers'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'
import { parseResultHeader } from '@quickbot.io/results/parseResultHeader'

export const parseSampleResult =
  (
    bot: Pick<Bot | PublicBot, 'groups' | 'variables' | 'edges'>,
    linkedBots: (Bot | PublicBot)[],
    userEmail?: string,
  ) =>
  async (
    currentGroupId: string,
    variables: Variable[],
  ): Promise<Record<string, string | boolean | undefined>> => {
    const header = parseResultHeader(bot, linkedBots)
    const linkedInputBlocks = await extractLinkedInputBlocks(bot, linkedBots)(currentGroupId)

    return {
      message: 'This is a sample result, it has been generated ⬇️',
      submittedAt: new Date().toISOString(),
      ...parseResultSample(linkedInputBlocks, header, variables, userEmail),
    }
  }

const extractLinkedInputBlocks =
  (bot: Pick<Bot | PublicBot, 'groups' | 'variables' | 'edges'>, linkedBots: (Bot | PublicBot)[]) =>
  async (
    currentGroupId?: string,
    direction: 'backward' | 'forward' = 'backward',
  ): Promise<InputBlock[]> => {
    const previousLinkedBotBlocks = walkEdgesAndExtract(
      'linkedBot',
      direction,
      bot,
    )({
      groupId: currentGroupId,
    }) as BotLinkBlock[]

    const linkedBotInputs =
      previousLinkedBotBlocks.length > 0
        ? await Promise.all(
            previousLinkedBotBlocks.map((botLinkBlock) => {
              const linkedBot = linkedBots.find((t) =>
                'botId' in t
                  ? t.botId === botLinkBlock.options?.botId
                  : t.id === botLinkBlock.options?.botId,
              )
              if (!linkedBot) return []
              return extractLinkedInputBlocks(linkedBot, linkedBots)(
                botLinkBlock.options?.groupId,
                'forward',
              )
            }),
          )
        : []

    return (
      walkEdgesAndExtract(
        'input',
        direction,
        bot,
      )({
        groupId: currentGroupId,
      }) as InputBlock[]
    ).concat(linkedBotInputs.flatMap((l) => l))
  }

const parseResultSample = (
  inputBlocks: InputBlock[],
  headerCells: ResultHeaderCell[],
  variables: Variable[],
  userEmail?: string,
) =>
  headerCells.reduce<Record<string, string | (string | null)[] | undefined>>(
    (resultSample, cell) => {
      const inputBlock = inputBlocks.find((inputBlock) =>
        cell.blocks?.some((block) => block.id === inputBlock.id),
      )
      if (isNotDefined(inputBlock)) {
        if (cell.variableIds) {
          const variableValue = variables.find(
            (variable) => cell.variableIds?.includes(variable.id) && variable.value,
          )?.value
          return {
            ...resultSample,
            [cell.label]: variableValue ?? 'content',
          }
        }

        return resultSample
      }
      const variableValue = variables.find(
        (variable) => cell.variableIds?.includes(variable.id) && variable.value,
      )?.value
      const value = variableValue ?? getSampleValue(inputBlock, userEmail)
      return {
        ...resultSample,
        [cell.label]: value,
      }
    },
    {},
  )

const getSampleValue = (block: InputBlock, userEmail?: string): string => {
  switch (block.type) {
    case InputBlockType.CHOICE:
      return block.options?.isMultipleChoice
        ? block.items.map((item) => item.content).join(', ')
        : block.items[0]?.content ?? 'Item'
    case InputBlockType.DATE:
      return new Date().toUTCString()
    case InputBlockType.EMAIL:
      return userEmail ?? 'email@example.com'
    case InputBlockType.NUMBER:
      return '20'
    case InputBlockType.PHONE:
      return '+59895761512'
    case InputBlockType.TEXT:
      return 'answer value'
    case InputBlockType.URL:
      return 'https://test.com'
    case InputBlockType.FILE:
      return 'https://my-site.com/fake-file.png'
    case InputBlockType.RATING:
      return '8'
    case InputBlockType.PAYMENT:
      return 'Success'
  }
}

const walkEdgesAndExtract =
  (
    type: 'input' | 'linkedBot',
    direction: 'backward' | 'forward',
    bot: Pick<Bot | PublicBot, 'groups' | 'variables' | 'edges'>,
  ) =>
  ({ groupId }: { groupId?: string }): Block[] => {
    const currentGroupId =
      groupId ?? (bot.groups.find((b) => b.blocks[0].type === 'start')?.id as string)
    const blocksInGroup = extractBlocksInGroup(
      type,
      bot,
    )({
      groupId: currentGroupId,
    })
    const otherGroupIds = getGroupIdsLinkedToGroup(bot, direction)(currentGroupId)
    return blocksInGroup.concat(
      otherGroupIds.flatMap((groupId) => extractBlocksInGroup(type, bot)({ groupId })),
    )
  }

const getGroupIdsLinkedToGroup =
  (
    bot: Pick<Bot | PublicBot, 'groups' | 'variables' | 'edges'>,
    direction: 'backward' | 'forward',
    visitedGroupIds: string[] = [],
  ) =>
  (groupId: string): string[] => {
    const linkedGroupIds = bot.edges.reduce<string[]>((groupIds, edge) => {
      const fromGroupId = bot.groups.find((g) =>
        g.blocks.some((b) => 'blockId' in edge.from && b.id === edge.from.blockId),
      )?.id
      if (!fromGroupId) return groupIds
      if (direction === 'forward') {
        if (
          (!visitedGroupIds || !visitedGroupIds?.includes(edge.to.groupId)) &&
          fromGroupId === groupId
        ) {
          visitedGroupIds.push(edge.to.groupId)
          return groupIds.concat(edge.to.groupId)
        }
        return groupIds
      }
      if (!visitedGroupIds.includes(fromGroupId) && edge.to.groupId === groupId) {
        visitedGroupIds.push(fromGroupId)
        return groupIds.concat(fromGroupId)
      }
      return groupIds
    }, [])
    return linkedGroupIds.concat(
      linkedGroupIds.flatMap(getGroupIdsLinkedToGroup(bot, direction, visitedGroupIds)),
    )
  }

const extractBlocksInGroup =
  (type: 'input' | 'linkedBot', bot: Pick<Bot | PublicBot, 'groups' | 'variables' | 'edges'>) =>
  ({ groupId, blockId }: { groupId: string; blockId?: string }) => {
    const currentGroup = bot.groups.find(byId(groupId))
    if (!currentGroup) return []
    const blocks: Block[] = []
    for (const block of currentGroup.blocks) {
      if (block.id === blockId) break
      if (type === 'input' && isInputBlock(block)) blocks.push(block)
      if (type === 'linkedBot' && block.type === LogicBlockType.BOT_LINK) blocks.push(block)
    }
    return blocks
  }
