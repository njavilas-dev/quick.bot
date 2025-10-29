export const BUBBLE_BLOCK_TYPES = ['text', 'image', 'video', 'audio', 'embed'] as const

export const INPUT_BLOCK_TYPES = [
  'text input',
  'email input',
  'number input',
  'phone number input',
  'date input',
  'url input',
  'buttons input',
  'rating input',
  'file input',
  'stripe',
] as const

export type BubbleBlockType = (typeof BUBBLE_BLOCK_TYPES)[number]
export type InputBlockType = (typeof INPUT_BLOCK_TYPES)[number]

export function isBubbleBlock(type: string): type is BubbleBlockType {
  return BUBBLE_BLOCK_TYPES.includes(type as BubbleBlockType)
}

export function isInputBlock(type: string): type is InputBlockType {
  return INPUT_BLOCK_TYPES.includes(type as InputBlockType)
}

export function isFileInputBlock(type: string): boolean {
  return type === 'file input'
}
