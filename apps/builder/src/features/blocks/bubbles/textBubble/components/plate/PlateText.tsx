import { useBot } from '@/features/editor/providers/BotProvider'
import { VariableTag } from '@/features/graph/components/nodes/block/VariableTag'
import { useMemo, memo } from 'react'

// Pre-compile regex patterns outside component for better performance
const INLINE_CODE_REGEX = /\{\{=(.*?=\}\})/g
const VARIABLE_REGEX = /\{\{(.*?\}\})/g

export const PlateText = ({
  text,
  bold,
  italic,
  underline,
}: {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
}) => {
  let className = ''
  if (bold) className += 'slate-bold'
  if (italic) className += ' slate-italic'
  if (underline) className += ' slate-underline'
  if (className)
    return (
      <span className={className}>
        <PlateTextContent text={text} />
      </span>
    )
  return <PlateTextContent text={text} />
}

const PlateTextContent = memo(({ text }: { text: string }) => {
  const { bot } = useBot()

  // Create a Map for O(1) variable lookups instead of O(n) array.find()
  const variablesMap = useMemo(() => {
    if (!bot?.variables) return new Map()
    return new Map(bot.variables.map((variable) => [variable.name, variable]))
  }, [bot?.variables])

  // Memoize the parsed content to avoid re-parsing on every render
  const parsedContent = useMemo(() => {
    return text.split(INLINE_CODE_REGEX).map((str, idx) => {
      if (str.endsWith('=}}')) {
        return (
          <span className="slate-inline-code" key={`code-${idx}`}>
            {str.trim().slice(0, -3)}
          </span>
        )
      }
      return str.split(VARIABLE_REGEX).map((str, subIdx) => {
        if (str.endsWith('}}')) {
          const variableName = str.trim().slice(0, -2)
          const matchingVariable = variablesMap.get(variableName)
          if (!matchingVariable) {
            return '{{' + str
          }
          return (
            <VariableTag key={`var-${idx}-${subIdx}`} variableName={variableName} />
          )
        }
        return str
      })
    })
  }, [text, variablesMap])

  return <>{parsedContent}</>
})

PlateTextContent.displayName = 'PlateTextContent'
