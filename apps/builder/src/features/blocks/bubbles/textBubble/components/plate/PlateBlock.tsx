import { TElement, TText, TDescendant } from '@urbiport/ui'
import { PlateText } from './PlateText'
import { memo, useMemo } from 'react'

// Helper function to normalize URLs - moved outside component
const normalizeUrl = (url: string): string => {
  return url.startsWith('http://') || url.startsWith('https://')
    ? url
    : `https://${url}`
}

// Generate stable key for elements
const getElementKey = (element: TElement | TText, idx: number): string => {
  if ('text' in element && typeof element.text === 'string') {
    // For text nodes, use a hash of the text content
    return `text-${idx}-${element.text.slice(0, 20)}`
  }
  if ('type' in element && element.type) {
    // For element nodes, use type and index
    return `${element.type}-${idx}`
  }
  return `element-${idx}`
}

const PlateBlockComponent = ({ element }: { element: TElement | TText }) => {
  // Memoize normalized URL - must be called before any early returns
  const normalizedUrl = useMemo(() => {
    if ('type' in element && element.type === 'a' && element.url) {
      return normalizeUrl(element.url as string)
    }
    return undefined
  }, [element])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ('text' in element) return <PlateText {...(element as any)} />

  switch (element.type) {
    case 'a': {
      return (
        <a href={normalizedUrl} target="_blank" className="slate-a">
          {(element.children as TDescendant[])?.map((child, idx) => (
            <PlateBlock key={getElementKey(child, idx)} element={child} />
          ))}
        </a>
      )
    }
    default: {
      return (
        <div>
          {(element.children as TDescendant[])?.map((child, idx) => (
            <PlateBlock key={getElementKey(child, idx)} element={child} />
          ))}
        </div>
      )
    }
  }
}

PlateBlockComponent.displayName = 'PlateBlock'

export const PlateBlock = memo(PlateBlockComponent)
