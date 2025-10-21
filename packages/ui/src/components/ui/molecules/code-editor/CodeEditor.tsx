import React, { forwardRef, useEffect, useRef, useState } from 'react'
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { tokyoNight } from '@uiw/codemirror-theme-tokyo-night'
import { githubLight } from '@uiw/codemirror-theme-github'
import { LanguageName, loadLanguage } from '@uiw/codemirror-extensions-langs'
import { BoxProps, Fade, useColorModeValue, useDisclosure } from '@chakra-ui/react'
import { BoxCard } from '../../atoms'
import { CodeEditorToolbar, ToolbarItem } from './CodeEditorToolbar'
import { useOnChangeDebounced } from '../../../../hooks'

export type { ReactCodeMirrorRef }

export type CodeEditorProps = {
  defaultValue?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  toolbarItems?: ToolbarItem[]
  lang: LanguageName
  isReadOnly?: boolean
  placeholder?: string
  debounceTimeout?: number
  height?: string
  maxHeight?: string
  minWidth?: string
  maxWidth?: string
}

export const CodeEditor = forwardRef<
  ReactCodeMirrorRef,
  CodeEditorProps & Omit<BoxProps, 'onChange'>
>(
  (
    {
      lang,
      defaultValue,
      onChange: _onChange,
      onBlur,
      height = '250px',
      maxHeight = '70vh',
      minWidth,
      maxWidth,
      isReadOnly = false,
      placeholder,
      debounceTimeout = 0,
      ...props
    },
    ref,
  ) => {
    const theme = useColorModeValue(githubLight, tokyoNight)
    const codeEditorRef = useRef<ReactCodeMirrorRef | null>(null)
    const [localValue, setLocalValue] = useState<string>(defaultValue ?? '')
    const { onOpen, onClose, isOpen } = useDisclosure()

    const { onChange } = useOnChangeDebounced<string>({
      onChange: _onChange ?? (() => { }),
      debounceTimeout,
    })

    const handleChange = (newValue: string) => {
      onChange(newValue)
    }

    useEffect(() => {
      if (localValue === defaultValue) return
      setLocalValue(defaultValue ?? '')
    }, [defaultValue])

    return (
      <BoxCard
        display="block"
        position="relative"
        width="full"
        h="full"
        p={0}
        m={0}
        onMouseEnter={onOpen}
        onMouseLeave={onClose}
        minW={minWidth}
        maxWidth={maxWidth}
        sx={{
          '& .cm-editor': {
            maxH: maxHeight,
            outline: '0px solid transparent !important',
            rounded: 'md',
          },
          '& .cm-scroller': {
            rounded: 'md',
            overflow: 'auto',
          },
          '& .cm-gutter,.cm-content': {
            minH: isReadOnly ? '0' : height,
          },
          '& .ͼ1 .cm-scroller': {
            fontSize: '14px',
            fontFamily:
              'JetBrainsMono, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
          },
        }}
      >
        <CodeMirror
          data-testid="code-editor"
          ref={(instance) => {
            codeEditorRef.current = instance
            if (typeof ref === 'function') {
              ref(instance)
            } else if (ref) {
              ref.current = instance
            }
          }}
          value={localValue}
          onChange={handleChange}
          theme={theme}
          extensions={[loadLanguage(lang)!].filter((value) => !!value)}
          editable={!isReadOnly}
          spellCheck={false}
          basicSetup={{
            highlightActiveLine: false,
          }}
          placeholder={placeholder}
          onBlur={onBlur}
        />
        <Fade in={isOpen}>
          <CodeEditorToolbar
            isReadOnly={isReadOnly}
            value={localValue}
            {...props}
          />
        </Fade>
      </BoxCard>
    )
  },
)

CodeEditor.displayName = 'CodeEditor'
