import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Plate, PlatePlugin, PlateProps } from '@udecode/plate-core'
import { TElement } from '@udecode/plate-common'
import { BoxCard } from '../../atoms'
import { plugins } from './helpers'
import { texteditorStyle } from './style'
import { TexteditorContent } from './TexteditorContent'
import { TexteditorToolbar, ToolbarItem } from './TexteditorToolbar'
import { useOnChangeDebounced } from '../../../../hooks'
import { DefaultLeaf, RenderLeafProps } from 'slate-react'

export type TexteditorProps = {
  id: string
  defaultValue: TElement[]
  onChange: (newContent: TElement[]) => void
  debounceTimeout?: number
  placeholder?: string
  isDisabled?: boolean
  onClose: () => void
  platePlugins?: PlatePlugin[]
  toolbarItems?: ToolbarItem[]
} & Omit<PlateProps, 'defaultValue' | 'onChange' | 'id' | 'children' | 'plugins'>

const SanitizedLeaf = (props: RenderLeafProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { leafPosition, ...rest } = props as RenderLeafProps
  return <DefaultLeaf {...rest} />
}

// Memoize default empty value to avoid recreating on every render
const DEFAULT_EMPTY_VALUE: TElement[] = [{ type: 'p', children: [{ text: '' }] }]

export const Texteditor = ({
  id,
  defaultValue,
  onChange: _onChange,
  debounceTimeout = 0,
  platePlugins = [],
  toolbarItems = [],
}: TexteditorProps) => {
  const [localValue, setLocalValue] = useState<TElement[]>(defaultValue)
  const isInitialRender = React.useRef(true)

  useEffect(() => {
    if (localValue === defaultValue) return
    setLocalValue(defaultValue ?? '')
  }, [defaultValue])

  const isDefaultEmpty = useCallback((content: TElement[]) => {
    return (
      content.length === 1 &&
      content[0].type === 'p' &&
      Array.isArray(content[0].children) &&
      content[0].children.length === 1 &&
      'text' in content[0].children[0] &&
      content[0].children[0].text === ''
    )
  }, [])

  // Memoize the onChange handler to avoid recreating on every render
  const handleContentChange = useCallback(
    (newContent: TElement[]) => {
      if (isInitialRender.current && defaultValue.length === 0 && isDefaultEmpty(newContent)) {
        isInitialRender.current = false
        return
      }
      isInitialRender.current = false
      _onChange(newContent)
    },
    [defaultValue.length, isDefaultEmpty, _onChange]
  )

  const { onChange } = useOnChangeDebounced<TElement[]>({
    onChange: handleContentChange,
    debounceTimeout,
  })

  // Memoize plugins array to prevent Plate from re-initializing unnecessarily
  const allPlugins = useMemo(() => [...plugins, ...platePlugins], [platePlugins])

  // Memoize plate value to avoid unnecessary re-renders
  const plateValue = useMemo(
    () => (localValue.length === 0 ? DEFAULT_EMPTY_VALUE : localValue),
    [localValue]
  )

  return (
    <Plate
      id={id}
      plugins={allPlugins}
      value={plateValue}
      onChange={onChange}
      renderLeaf={SanitizedLeaf}
    >
      <BoxCard
        pos="relative"
        cursor="text"
        p={0}
        gap={0}
        className="prevent-group-drag"
        onContextMenuCapture={(e) => e.stopPropagation()}
        sx={texteditorStyle}
      >
        <TexteditorToolbar toolbarItems={toolbarItems} />
        <TexteditorContent />
      </BoxCard>
    </Plate>
  )
}
