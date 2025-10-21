import { Draft } from 'immer'
import { createId } from '@quickbot.io/lib/createId'
import { BlockV6, Variable, BotV6, Edge } from '@quickbot.io/schemas'
import { blockHasItems, blockHasOptions } from '@quickbot.io/schemas/helpers'
import {
  TemplateOption,
  TemplateEdge,
  TemplateEdgeWithId,
  VariableTemplate,
} from '@/features/blocks/template/types'
import { blockTemplates } from '@/features/blocks/template/block-templates'
import { extractVariableIdsFromObject } from '@quickbot.io/variables/extractVariablesFromObject'

export const applyBlockTemplate = (
  bot: Draft<BotV6>,
  blockType: BlockV6['type'],
  groupIndex: number,
  blockIndex: number,
  templateId?: string,
): {
  mainBlockIndex: number
  createdVariables: Variable[]
  createdBlocks: BlockV6[]
  hasMainBlockInTemplate: boolean
  createdEdges: Edge[]
} => {
  const templates = getBlockTemplates(blockType)
  let selectedTemplate: TemplateOption | undefined

  if (templateId) {
    selectedTemplate = templates.find((t) => t.id === templateId)
  } else {
    selectedTemplate = templates.find((t) => t.isDefault) || templates[0]
  }

  if (!selectedTemplate) {
    return {
      mainBlockIndex: blockIndex,
      createdVariables: [],
      createdBlocks: [],
      hasMainBlockInTemplate: false,
      createdEdges: [],
    }
  }

  // Deep clone the template to avoid mutating the original
  const template = JSON.parse(JSON.stringify(selectedTemplate.template))
  const oldToNewIdsMapping = new Map<string, string>()
  const createdVariables: Variable[] = []
  const createdBlocks: BlockV6[] = []
  const createdEdges: Edge[] = []

  // Step 1: Process variables (create new or map to existing)
  if (template.variables) {
    template.variables.forEach((variableTemplate: VariableTemplate) => {
      const tempId = `temp-var-${variableTemplate.name}`
      const existingVariable = bot.variables.find((v) => v.name === variableTemplate.name)

      if (existingVariable) {
        oldToNewIdsMapping.set(tempId, existingVariable.id)
      } else {
        const newId = createId()
        oldToNewIdsMapping.set(tempId, newId)
        const variable: Variable = {
          id: newId,
          ...variableTemplate,
        }
        bot.variables.unshift(variable)
        createdVariables.push(variable)
      }
    })
  }

  // Step 2: Create template edges with placeholder IDs
  const templateEdgesToCreate: TemplateEdgeWithId[] = []

  if (template.edges) {
    template.edges.forEach((edgeTemplate: TemplateEdge) => {
      const fromBlockPlaceholder = `temp-block-${edgeTemplate.fromBlockIndex}`
      const toBlockPlaceholder = `temp-block-${edgeTemplate.toBlockIndex}`
      const edgeId = createId()

      templateEdgesToCreate.push({
        edge: {
          id: edgeId,
          from: {
            blockId: fromBlockPlaceholder,
            ...(edgeTemplate.fromItemId && { itemId: edgeTemplate.fromItemId }),
          } as Edge['from'],
          to: {
            groupId: bot.groups[groupIndex].id,
            blockId: toBlockPlaceholder,
          },
        },
        templateEdge: edgeTemplate,
      })
    })
  }

  // Check if the template includes the main block type
  const hasMainBlockInTemplate = template.blocks.some((block: Partial<BlockV6>) => block.type === blockType)
  let mainBlockIndex = blockIndex

  // Step 3: Process blocks
  template.blocks.forEach((blockTemplate: Partial<BlockV6> & { type: BlockV6['type'] }, index: number) => {
    const blockPlaceholderId = `temp-block-${index}`
    const newBlockId = createId()
    oldToNewIdsMapping.set(blockPlaceholderId, newBlockId)

    let processedBlock = { ...blockTemplate }

    // Replace variable ID placeholders
    if (template.variables) {
      template.variables.forEach((variableTemplate: VariableTemplate) => {
        const tempVarId = `temp-var-${variableTemplate.name}`
        const actualVarId = oldToNewIdsMapping.get(tempVarId)
        if (actualVarId) {
          const placeholder = `{{${variableTemplate.name}Id}}`
          processedBlock = JSON.parse(
            JSON.stringify(processedBlock).replace(new RegExp(placeholder, 'g'), actualVarId),
          )
        }
      })
    }

    // Replace variable IDs in options
    if (blockHasOptions(processedBlock as BlockV6)) {
      const blockWithOptions = processedBlock as BlockV6 & { options: Record<string, unknown> }
      if (blockWithOptions.options) {
        const variableIdsToReplace = extractVariableIdsFromObject(blockWithOptions.options).filter((v) =>
          v.startsWith('temp-var-'),
        )
        if (variableIdsToReplace.length > 0) {
          let optionsStr = JSON.stringify(blockWithOptions.options)
          variableIdsToReplace.forEach((tempVarId) => {
            const newId = oldToNewIdsMapping.get(tempVarId)
            if (newId) {
              optionsStr = optionsStr.replace(new RegExp(tempVarId, 'g'), newId)
            }
          })
          blockWithOptions.options = JSON.parse(optionsStr)
          processedBlock = blockWithOptions
        }
      }
    }

    // Handle items with outgoing edges
    if (blockHasItems(processedBlock as BlockV6)) {
      const blockWithItems = processedBlock as BlockV6 & { items?: Array<{ id: string; [key: string]: unknown }> }
      const mappedItems = blockWithItems.items?.map((item) => {
        const oldItemId = item.id
        const newItemId = createId()

        // Map old item ID to new item ID
        oldToNewIdsMapping.set(oldItemId, newItemId)

        let outgoingEdgeId: string | undefined = undefined

        // Check if this item has an outgoing edge in the template
        const edgeForItem = templateEdgesToCreate.find(
          ({ templateEdge }) =>
            templateEdge.fromBlockIndex === index && templateEdge.fromItemId === oldItemId,
        )

        if (edgeForItem) {
          outgoingEdgeId = edgeForItem.edge.id
          // Update the edge's from.itemId to the new item ID
          if ('blockId' in edgeForItem.edge.from) {
            edgeForItem.edge.from = {
              ...edgeForItem.edge.from,
              itemId: newItemId,
            }
          }
        }

        return {
          ...item,
          id: newItemId,
          blockId: newBlockId,
          outgoingEdgeId,
        }
      })
      if (mappedItems) {
        blockWithItems.items = mappedItems
        processedBlock = blockWithItems
      }
    }

    // Handle block outgoing edge
    let outgoingEdgeId: string | undefined = undefined
    const edgeForBlock = templateEdgesToCreate.find(
      ({ templateEdge }) => templateEdge.fromBlockIndex === index && !templateEdge.fromItemId,
    )
    if (edgeForBlock) {
      outgoingEdgeId = edgeForBlock.edge.id
    }

    const block: BlockV6 = {
      ...processedBlock,
      id: newBlockId,
      outgoingEdgeId,
    } as BlockV6

    bot.groups[groupIndex].blocks.splice(blockIndex + index, 0, block)
    createdBlocks.push(block)

    if (block.type === blockType) {
      mainBlockIndex = blockIndex + index
    }
  })

  // Step 4: Create edges with actual IDs
  templateEdgesToCreate.forEach(({ edge }) => {
    if (!('blockId' in edge.from)) {
      return // Skip non-block edges
    }

    const fromBlockId = oldToNewIdsMapping.get(edge.from.blockId)
    const toBlockId = edge.to.blockId ? oldToNewIdsMapping.get(edge.to.blockId) : undefined

    if (!fromBlockId) {
      console.warn(`Could not find mapped block ID for ${edge.from.blockId}`)
      return
    }

    const finalEdge: Edge = {
      id: edge.id,
      from: {
        blockId: fromBlockId,
        ...('itemId' in edge.from && edge.from.itemId && { itemId: edge.from.itemId }),
      } as Edge['from'],
      to: {
        groupId: bot.groups[groupIndex].id,
        ...(toBlockId && { blockId: toBlockId }),
      },
    }

    bot.edges.push(finalEdge)
    createdEdges.push(finalEdge)
  })

  return {
    mainBlockIndex,
    createdVariables,
    createdBlocks,
    hasMainBlockInTemplate,
    createdEdges,
  }
}

export const getBlockTemplates = (blockType: BlockV6['type']): TemplateOption[] => {
  return blockTemplates[blockType] ?? []
}

export const hasBlockTemplate = (blockType: BlockV6['type']): boolean => {
  const templates = getBlockTemplates(blockType)
  return templates.length > 0
}

export const getTemplateById = (
  blockType: BlockV6['type'],
  templateId: string,
): TemplateOption | undefined => {
  const templates = getBlockTemplates(blockType)
  return templates.find((t) => t.id === templateId)
}

export const hasMultipleTemplates = (blockType: BlockV6['type']): boolean => {
  const templates = getBlockTemplates(blockType)
  return templates.length > 1
}

export const getBlockTemplate = (blockType: BlockV6['type']): TemplateOption | undefined => {
  const templates = getBlockTemplates(blockType)
  return templates.find((t) => t.isDefault) || templates[0]
}

export const shouldShowTemplateConfirmation = (blockType: BlockV6['type']): boolean => {
  return hasBlockTemplate(blockType)
}
