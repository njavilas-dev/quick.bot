import { BlockV6, Variable, Edge } from '@quickbot.io/schemas'

export interface TemplateEdge {
  /** Index of the source block in the blocks array */
  fromBlockIndex: number
  /** Optional item ID for condition blocks or other blocks with items */
  fromItemId?: string
  /** Index of the target block in the blocks array */
  toBlockIndex: number
}

/** Helper type for template edge processing with actual Edge ID */
export interface TemplateEdgeWithId {
  edge: Edge
  templateEdge: TemplateEdge
}

/** Variable template without ID */
export type VariableTemplate = Omit<Variable, 'id'>

export interface BlockTemplate {
  /** Array of blocks in the order they should be created */
  blocks: Partial<BlockV6>[]
  /** Variables to create */
  variables?: VariableTemplate[]
  /** Internal edges connecting blocks within the template */
  edges?: TemplateEdge[]
}

/** Individual template with metadata */
export interface TemplateOption {
  id: string
  title: string
  description: string
  icon?: string
  isDefault?: boolean
  template: BlockTemplate
}

/** Configuration for block templates by block type */
export type BlockTemplateConfigs = {
  [blockType in BlockV6['type']]?: TemplateOption[]
}
