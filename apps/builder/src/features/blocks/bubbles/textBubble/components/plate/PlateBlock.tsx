import { TElement, TText, TDescendant } from '@urbiport/ui'
import { PlateText } from './PlateText'

export const PlateBlock = ({ element }: { element: TElement | TText }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (element.text) return <PlateText {...(element as any)} />
  switch (element.type) {
    case 'a': {
      const url = element.url as string
      const normalizedUrl = url.startsWith('http://') || url.startsWith('https://')
        ? url
        : `https://${url}`
      return (
        <a href={normalizedUrl} target="_blank" className="slate-a">
          {(element.children as TDescendant[])?.map((child, idx) => (
            <PlateBlock key={idx} element={child} />
          ))}
        </a>
      )
    }
    default: {
      return (
        <div>
          {(element.children as TDescendant[])?.map((child, idx) => (
            <PlateBlock key={idx} element={child} />
          ))}
        </div>
      )
    }
  }
}
