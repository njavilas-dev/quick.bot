import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { FormControl } from '@urbiport/ui'
import React from 'react'

type Props = {
  customCss?: string
  onCustomCssChange: (css: string) => void
}

export const ThemeCustomCssForm = ({ customCss, onCustomCssChange }: Props) => {
  return (
    <FormControl>
      <CodeEditorWithVariables
        defaultValue={customCss ?? ''}
        lang="css"
        onChange={onCustomCssChange}
        withVariableButton={false}
      />
    </FormControl>
  )
}
