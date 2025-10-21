import { ToolResultPart } from 'ai'

export function getLastToolResult(
  toolResults: ToolResultPart[] | undefined,
  toolName?: string,
): ToolResultPart | undefined {
  if (!toolResults?.length) return
  if (toolName) {
    for (let i = toolResults.length - 1; i >= 0; i--) {
      const tr = toolResults[i] as any
      if (tr?.toolName === toolName) return tr
    }
  }
  return toolResults[toolResults.length - 1]
}
