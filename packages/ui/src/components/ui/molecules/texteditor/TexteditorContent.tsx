import React, { useRef, useState } from 'react'
import { selectEditor } from '@udecode/plate-common'
import { PlateContent, PlateContentProps, useEditorRef } from '@udecode/plate-core'
import { texteditorContentStyle } from './style'

type TexteditorContentProps = {} & Omit<PlateContentProps, 'children'>

export const TexteditorContent = (props: TexteditorContentProps) => {
  const editor = useEditorRef()
  const [isFirstFocus, setIsFirstFocus] = useState(true)

  const rememberedSelection = useRef<typeof editor.selection | null>(null)

  const handleOnFocus = () => {
    rememberedSelection.current = null
    if (!isFirstFocus || !editor) return
    if (editor.children.length === 0) return
    selectEditor(editor, {
      edge: 'end',
    })
    setIsFirstFocus(false)
  }

  const handleOnBlur = () => {
    if (!editor) return
    rememberedSelection.current = editor.selection
  }

  return (
    <PlateContent
      style={texteditorContentStyle}
      autoFocus
      onFocus={handleOnFocus}
      onBlur={handleOnBlur}
      {...props}
    />
  )
}
