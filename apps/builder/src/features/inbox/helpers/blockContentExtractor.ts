import type { Block } from '@quickbot.io/schemas'

export function getBlockDisplayContent(block: Block): string | undefined {
  if ('content' in block && block.content) {
    if (typeof block.content === 'string') {
      return block.content
    }

    if (typeof block.content === 'object' && 'richText' in block.content) {
      const richText = (block.content as Record<string, unknown>).richText
      if (Array.isArray(richText)) {
        return extractTextFromRichText(richText)
      }
    }

    if (block.type === 'image' && 'url' in block.content) {
      return `[Image: ${(block.content as Record<string, unknown>).url}]`
    }
    if (block.type === 'video' && 'url' in block.content) {
      return `[Video: ${(block.content as Record<string, unknown>).url}]`
    }
    if (block.type === 'audio' && 'url' in block.content) {
      return `[Audio: ${(block.content as Record<string, unknown>).url}]`
    }
  }

  if ('options' in block && block.options && typeof block.options === 'object') {
    const options = block.options as Record<string, unknown>
    const labels = options.labels as Record<string, unknown> | undefined
    if (labels?.placeholder) return labels.placeholder as string
    if (labels?.button) return labels.button as string
  }

  return undefined
}

export function extractTextFromRichText(nodes: unknown[]): string {
  let text = ''

  for (const node of nodes) {
    const nodeObj = node as Record<string, unknown>
    if (nodeObj.text) {
      text += nodeObj.text as string
    } else if (nodeObj.children && Array.isArray(nodeObj.children)) {
      text += extractTextFromRichText(nodeObj.children)

      if (nodeObj.type === 'p' && text && !text.endsWith('\n')) {
        text += '\n'
      }
    }
  }

  return text.trim()
}

export function extractMediaUrl(content: string | undefined): string | undefined {
  if (!content) return undefined

  const urlMatch = content.match(/\[(Image|Video|Audio):\s*(.+?)\]/)
  return urlMatch?.[2]
}

export function detectMediaType(
  content: string | undefined,
  blockType: string | undefined,
): 'image' | 'video' | 'audio' | null {
  if (blockType === 'image' || content?.startsWith('[Image:')) return 'image'
  if (blockType === 'video' || content?.startsWith('[Video:')) return 'video'
  if (blockType === 'audio' || content?.startsWith('[Audio:')) return 'audio'
  return null
}
