import React, { useRef, useState } from 'react'
import { IconButton } from '@chakra-ui/react'
import { Variable } from '@quickbot.io/schemas'
import { CodeEditor, ReactCodeMirrorRef } from '@urbiport/ui'
import { VariableIcon } from '@urbiport/icons'
import { VariablesDropdown } from '@/features/variables/components/VariablesDropdown'
import { useTranslate } from '@tolgee/react'

type CodeEditorWithVariablesProps = {
  debounceTimeout?: number
  withVariableButton?: boolean
  onVariableInsert?: (variable: string) => void
} & Parameters<typeof CodeEditor>[0]

export const CodeEditorWithVariables: React.FC<CodeEditorWithVariablesProps> = ({
  withVariableButton = false,
  onVariableInsert,
  ...props
}) => {
  const { t } = useTranslate()
  const codeEditorRef = useRef<ReactCodeMirrorRef | null>(null)
  const [carretPosition, setCarretPosition] = useState(0)

  const handleVariableSelected = (variable?: Variable) => {
    if (!variable) return
    const insert = `{{${variable.name}}}`
    onVariableInsert?.(insert)
    if (codeEditorRef.current?.view) {
      codeEditorRef.current.view.dispatch({
        changes: {
          from: carretPosition,
          insert,
        },
        selection: { anchor: carretPosition + insert.length },
      })
    }
  }

  const rememberCarretPosition = () => {
    setCarretPosition(codeEditorRef.current?.view?.state?.selection.asSingle().main.head ?? 0)
  }

  const toolbarItems = [
    {
      id: 'variables-button',
      render: () => (
        <VariablesDropdown
          placement="bottom-end"
          matchWidth={false}
          onSelect={handleVariableSelected}
          menuButtonProps={{
            as: IconButton,
            variant: 'outline',
            justifyContent: 'center',
            icon: <VariableIcon color="text.light" />,
            'aria-label': t('variables.button.tooltip'),
            px: 2,
            size: 'sm',
          }}
        />
      ),
    },
  ]

  return (
    <CodeEditor
      ref={codeEditorRef}
      onBlur={rememberCarretPosition}
      {...props}
      toolbarItems={withVariableButton ? toolbarItems : undefined}
    />
  )
}
