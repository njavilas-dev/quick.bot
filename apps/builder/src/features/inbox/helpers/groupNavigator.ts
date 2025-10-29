import type { Block, Bot, Group } from '@quickbot.io/schemas'

interface GroupNavigationResult {
  group: Group
  nextGroupId?: string
}

export class GroupNavigator {
  private blocksMap: Map<string, Block>
  private processedGroupIds: Set<string> = new Set()

  constructor(private currentBot: Bot, private startGroupId: string) {
    this.blocksMap = new Map()
    this.currentBot.groups.forEach((group) => {
      group.blocks.forEach((block) => {
        this.blocksMap.set(block.id, block)
      })
    })
  }

  *walkGroups(): Generator<GroupNavigationResult> {
    let currentGroupId: string | undefined = this.startGroupId

    while (currentGroupId && !this.processedGroupIds.has(currentGroupId)) {
      this.processedGroupIds.add(currentGroupId)

      const group = this.currentBot.groups.find((g) => g.id === currentGroupId)
      if (!group) break

      const nextGroupId = this.findNextGroupId(currentGroupId, group)

      yield { group, nextGroupId }

      currentGroupId = nextGroupId
    }
  }

  private findNextGroupId(currentGroupId: string, currentGroup: Group): string | undefined {
    const nextEdge = this.currentBot.edges.find((edge) => {
      if ('groupId' in edge.from && edge.from.groupId === currentGroupId && edge.to.groupId) {
        return true
      }

      if ('blockId' in edge.from && edge.from.blockId && edge.to.groupId) {
        const blockId = edge.from.blockId
        const block = currentGroup.blocks.find((b) => b.id === blockId)
        if (block) {
          return true
        }
      }

      return false
    })

    return nextEdge?.to.groupId
  }

  getBlock(blockId: string): Block | undefined {
    return this.blocksMap.get(blockId)
  }

  hasProcessed(groupId: string): boolean {
    return this.processedGroupIds.has(groupId)
  }
}

export function findStartGroupId(bot: Bot): string | undefined {
  const startEvent = bot.events?.find((e) => e.type === 'start')
  if (!startEvent) return undefined

  const startEdge = bot.edges.find((e) => 'eventId' in e.from && e.from.eventId === startEvent.id)
  return startEdge?.to.groupId
}
