import React, { useEffect, useState } from 'react'
import { Plate, PlatePlugin, PlateProps } from '@udecode/plate-core'
import { TElement } from '@udecode/plate-common'
import { BoxCard } from '../../atoms'
import { plugins } from './helpers'
import { texteditorStyle } from './style'
import { TexteditorContent } from './TexteditorContent'
import { TexteditorToolbar, ToolbarItem } from './TexteditorToolbar'
import { useOnChangeDebounced } from '../../../../hooks'

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

import { DefaultLeaf, RenderLeafProps } from 'slate-react'

const SanitizedLeaf = ({ ...rest }: RenderLeafProps) => <DefaultLeaf {...rest} />

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

  const isDefaultEmpty = (content: TElement[]) => {
    return (
      content.length === 1 &&
      content[0].type === 'p' &&
      Array.isArray(content[0].children) &&
      content[0].children.length === 1 &&
      'text' in content[0].children[0] &&
      content[0].children[0].text === ''
    )
  }

  const { onChange } = useOnChangeDebounced<TElement[]>({
    onChange: (newContent) => {
      if (isInitialRender.current && defaultValue.length === 0 && isDefaultEmpty(newContent)) {
        isInitialRender.current = false
        return
      }
      isInitialRender.current = false
      _onChange(newContent)
    },
    debounceTimeout,
  })

  return (
    <Plate
      id={id}
      plugins={[...plugins, ...platePlugins]}
      value={localValue.length === 0 ? [{ type: 'p', children: [{ text: '' }] }] : localValue}
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
