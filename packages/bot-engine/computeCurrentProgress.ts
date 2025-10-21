import { isDefined, byId } from '@quickbot.io/lib'
import { getBlockById, blockHasItems, isInputBlock } from '@quickbot.io/schemas/helpers'
import { Block, SessionState } from '@quickbot.io/schemas'

type Props = {
  botsQueue: SessionState['botsQueue']
  progressMetadata: NonNullable<SessionState['progressMetadata']>
  currentInputBlockId: string | undefined
}

export const computeCurrentProgress = ({
  botsQueue,
  progressMetadata,
  currentInputBlockId,
}: Props) => {
  if (!currentInputBlockId) return
  const paths = computePossibleNextInputBlocks({
    botsQueue: botsQueue,
    blockId: currentInputBlockId,
    visitedBlocks: {
      [botsQueue[0].bot.id]: [],
    },
    currentPath: [],
  })
  return (
    ((progressMetadata.totalAnswers + 1) /
      (Math.max(...paths.map((b) => b.length)) + (progressMetadata.totalAnswers + 1))) *
    100
  )
}

const computePossibleNextInputBlocks = ({
  currentPath,
  botsQueue,
  blockId,
  visitedBlocks,
}: {
  currentPath: string[]
  botsQueue: SessionState['botsQueue']
  blockId: string
  visitedBlocks: {
    [key: string]: string[]
  }
}): string[][] => {
  if (visitedBlocks[botsQueue[0].bot.id].includes(blockId)) return []
  visitedBlocks[botsQueue[0].bot.id].push(blockId)

  const possibleNextInputBlocks: string[][] = []

  const { block, group, blockIndex } = getBlockById(blockId, botsQueue[0].bot.groups)

  if (isInputBlock(block)) currentPath.push(block.id)

  const outgoingEdgeIds = getBlockOutgoingEdgeIds(block)

  for (const outgoingEdgeId of outgoingEdgeIds) {
    const to = botsQueue[0].bot.edges.find((e) => e.id === outgoingEdgeId)?.to
    if (!to) continue
    const blockId =
      to.blockId ?? botsQueue[0].bot.groups.find((g) => g.id === to.groupId)?.blocks[0].id
    if (!blockId) continue
    possibleNextInputBlocks.push(
      ...computePossibleNextInputBlocks({
        botsQueue,
        blockId,
        visitedBlocks,
        currentPath,
      }),
    )
  }

  for (const block of group.blocks.slice(blockIndex + 1)) {
    possibleNextInputBlocks.push(
      ...computePossibleNextInputBlocks({
        botsQueue,
        blockId: block.id,
        visitedBlocks,
        currentPath,
      }),
    )
  }

  if (outgoingEdgeIds.length > 0 || group.blocks.length !== blockIndex + 1)
    return possibleNextInputBlocks

  if (botsQueue.length > 1) {
    const nextEdgeId = botsQueue[0].edgeIdToTriggerWhenDone
    const to = botsQueue[1].bot.edges.find(byId(nextEdgeId))?.to
    if (!to) return possibleNextInputBlocks
    const blockId =
      to.blockId ?? botsQueue[0].bot.groups.find((g) => g.id === to.groupId)?.blocks[0].id
    if (blockId) {
      possibleNextInputBlocks.push(
        ...computePossibleNextInputBlocks({
          botsQueue: botsQueue.slice(1),
          blockId,
          visitedBlocks: {
            ...visitedBlocks,
            [botsQueue[1].bot.id]: [],
          },
          currentPath,
        }),
      )
    }
  }

  possibleNextInputBlocks.push(currentPath)

  return possibleNextInputBlocks
}

const getBlockOutgoingEdgeIds = (block: Block) => {
  const edgeIds: string[] = []
  if (blockHasItems(block)) {
    edgeIds.push(...block.items.map((i) => i.outgoingEdgeId).filter(isDefined))
  }
  if (block.outgoingEdgeId) edgeIds.push(block.outgoingEdgeId)
  return edgeIds
}
