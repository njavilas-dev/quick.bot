import { createId } from '@quickbot.io/lib/createId'
import { Draft, produce } from 'immer'
import {
  BlockIndices,
  BlockV6,
  BlockWithItems,
  Edge,
  GroupV6,
  BotV6,
  Variable,
} from '@quickbot.io/schemas'
import { SetBot } from '../BotProvider'
import {
  deleteGroupDraft,
  createBlockDraft,
  createBlockWithTemplateDraft,
  duplicateBlockDraft,
} from './blocks'
import { byId, isEmpty } from '@quickbot.io/lib'
import { blockHasItems, blockHasOptions } from '@quickbot.io/schemas/helpers'
import { Coordinates, CoordinatesMap } from '@/features/graph/types'
import { parseUniqueKey } from '@quickbot.io/lib/parseUniqueKey'
import { extractVariableIdsFromObject } from '@quickbot.io/variables/extractVariablesFromObject'

export type GroupsActions = {
  createGroup: (
    props: Coordinates & {
      id: string
      block: BlockV6 | BlockV6['type']
      indices: BlockIndices
      useTemplate?: boolean
      templateId?: string
    },
  ) => string | undefined
  updateGroup: (groupIndex: number, updates: Partial<Omit<GroupV6, 'id'>>) => void
  pasteGroups: (
    groups: GroupV6[],
    edges: Edge[],
    variables: Pick<Variable, 'id' | 'name'>[],
    oldToNewIdsMapping: Map<string, string>,
  ) => void
  updateGroupsCoordinates: (newCoord: CoordinatesMap) => void
  duplicateGroup: (groupIndex: number) => void
  deleteGroup: (groupIndex: number) => void
  deleteGroups: (groupIds: string[]) => void
}

const groupsActions = (setBot: SetBot): GroupsActions => ({
  createGroup: ({
    id,
    block,
    indices,
    groupLabel,
    useTemplate,
    templateId,
    ...graphCoordinates
  }: Coordinates & {
    id: string
    groupLabel?: string
    block: BlockV6 | BlockV6['type']
    indices: BlockIndices
    useTemplate?: boolean
    templateId?: string
  }) => {
    let newBlockId
    setBot((currentBot) =>
      produce(currentBot, (bot) => {
        const newGroup: GroupV6 = {
          id,
          graphCoordinates,
          title: `${groupLabel ?? 'Group'} #${bot.groups.length + 1}`,
          blocks: [],
        }
        bot.groups.push(newGroup)

        // Choose the appropriate block creation method based on useTemplate
        if (useTemplate === true) {
          newBlockId = createBlockWithTemplateDraft(bot, block, indices, templateId)
        } else {
          newBlockId = createBlockDraft(bot, block, indices)
        }
      }),
    )
    return newBlockId
  },
  updateGroup: (groupIndex: number, updates: Partial<Omit<GroupV6, 'id'>>) =>
    setBot((bot) =>
      produce(bot, (bot) => {
        const block = bot.groups[groupIndex]
        bot.groups[groupIndex] = { ...block, ...updates }
      }),
    ),
  updateGroupsCoordinates: (newCoord: CoordinatesMap) => {
    setBot((bot) =>
      produce(bot, (bot) => {
        bot.groups.forEach((group) => {
          if (newCoord[group.id]) {
            group.graphCoordinates = newCoord[group.id]
          }
        })
      }),
    )
  },
  duplicateGroup: (groupIndex: number) =>
    setBot((bot) =>
      produce(bot, (bot) => {
        const group = bot.groups[groupIndex]
        const id = createId()

        const groupTitle = isEmpty(group.title)
          ? ''
          : parseUniqueKey(
              group.title,
              bot.groups.map((g) => g.title),
            )

        const newGroup: GroupV6 = {
          ...group,
          title: groupTitle,
          id,
          blocks: group.blocks.map(duplicateBlockDraft),
          graphCoordinates: {
            x: (group.graphCoordinates?.x ?? 0) + 200,
            y: (group.graphCoordinates?.y ?? 0) + 100,
          },
        }
        bot.groups.splice(groupIndex + 1, 0, newGroup)
      }),
    ),
  deleteGroup: (groupIndex: number) =>
    setBot((bot) =>
      produce(bot, (bot) => {
        deleteGroupDraft(bot)(groupIndex)
      }),
    ),
  deleteGroups: (groupIds: string[]) =>
    setBot((bot) =>
      produce(bot, (bot) => {
        groupIds.forEach((groupId) => {
          deleteGroupByIdDraft(bot)(groupId)
        })
      }),
    ),
  pasteGroups: (
    groups: GroupV6[],
    edges: Edge[],
    variables: Omit<Variable, 'value'>[],
    oldToNewIdsMapping: Map<string, string>,
  ) => {
    const createdGroups: GroupV6[] = []
    setBot((bot) =>
      produce(bot, (bot) => {
        const edgesToCreate: Edge[] = []
        const variablesToCreate: Omit<Variable, 'value'>[] = []
        variables.forEach((variable) => {
          const existingVariable = bot.variables.find((v) => v.name === variable.name)
          if (existingVariable) {
            oldToNewIdsMapping.set(variable.id, existingVariable.id)
            return
          }
          const id = createId()
          oldToNewIdsMapping.set(variable.id, id)
          variablesToCreate.push({
            ...variable,
            id,
          })
        })
        groups.forEach((group) => {
          const groupTitle = isEmpty(group.title)
            ? ''
            : parseUniqueKey(
                group.title,
                bot.groups.map((g) => g.title),
              )
          const newGroup: GroupV6 = {
            ...group,
            title: groupTitle,
            blocks: group.blocks.map((block) => {
              const newBlock = { ...block }
              const blockId = createId()
              oldToNewIdsMapping.set(newBlock.id, blockId)
              if (blockHasOptions(newBlock) && newBlock.options) {
                const variableIdsToReplace = extractVariableIdsFromObject(newBlock.options).filter(
                  (v) => oldToNewIdsMapping.has(v),
                )
                if (variableIdsToReplace.length > 0) {
                  let optionsStr = JSON.stringify(newBlock.options)
                  variableIdsToReplace.forEach((variableId) => {
                    const newId = oldToNewIdsMapping.get(variableId)
                    if (!newId) return
                    optionsStr = optionsStr.replace(variableId, newId)
                  })
                  newBlock.options = JSON.parse(optionsStr)
                }
              }
              if (blockHasItems(newBlock)) {
                newBlock.items = newBlock.items?.map((item) => {
                  const id = createId()
                  let outgoingEdgeId = item.outgoingEdgeId
                  if (outgoingEdgeId) {
                    const edge = edges.find(byId(outgoingEdgeId))
                    if (edge) {
                      outgoingEdgeId = createId()
                      edgesToCreate.push({
                        ...edge,
                        id: outgoingEdgeId,
                      })
                      oldToNewIdsMapping.set(item.id, id)
                    } else {
                      outgoingEdgeId = undefined
                    }
                  }
                  return {
                    ...item,
                    blockId,
                    id,
                    outgoingEdgeId,
                  }
                }) as BlockWithItems['items']
              }
              let outgoingEdgeId = newBlock.outgoingEdgeId
              if (outgoingEdgeId) {
                const edge = edges.find(byId(outgoingEdgeId))
                if (edge) {
                  outgoingEdgeId = createId()
                  edgesToCreate.push({
                    ...edge,
                    id: outgoingEdgeId,
                  })
                } else {
                  outgoingEdgeId = undefined
                }
              }
              return {
                ...newBlock,
                id: blockId,
                outgoingEdgeId,
              }
            }),
          }
          bot.groups.push(newGroup)
          createdGroups.push(newGroup)
        })

        edgesToCreate.forEach((edge) => {
          if (!('blockId' in edge.from)) return
          const fromBlockId = oldToNewIdsMapping.get(edge.from.blockId)
          const toGroupId = oldToNewIdsMapping.get(edge.to.groupId)
          if (!fromBlockId || !toGroupId) return
          const newEdge: Edge = {
            ...edge,
            from: {
              ...edge.from,
              blockId: fromBlockId,
              itemId: edge.from.itemId ? oldToNewIdsMapping.get(edge.from.itemId) : undefined,
            },
            to: {
              ...edge.to,
              groupId: toGroupId,
              blockId: edge.to.blockId ? oldToNewIdsMapping.get(edge.to.blockId) : undefined,
            },
          }
          bot.edges.push(newEdge)
        })

        variablesToCreate.forEach((variableToCreate) => {
          bot.variables.unshift(variableToCreate)
        })
      }),
    )
  },
})

const deleteGroupByIdDraft = (bot: Draft<BotV6>) => (groupId: string) => {
  const groupIndex = bot.groups.findIndex(byId(groupId))
  if (groupIndex === -1) return
  deleteGroupDraft(bot)(groupIndex)
}

export { groupsActions }
