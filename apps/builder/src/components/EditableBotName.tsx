import { Editable, EditablePreview, EditableInput, Tooltip } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useTranslate } from '@tolgee/react'

type EditableProps = {
  defaultName: string
  onNewName: (newName: string) => void
  placeholder?: string
}
export const EditableBotName = ({ defaultName, onNewName, placeholder }: EditableProps) => {
  const { t } = useTranslate()
  const [currentName, setCurrentName] = useState(defaultName)

  const submitNewName = (newName: string) => {
    if (newName === '') return setCurrentName(defaultName)
    if (newName === defaultName) return
    onNewName(newName)
  }

  return (
    <Tooltip label={t('rename')}>
      <Editable value={currentName} onChange={setCurrentName} onSubmit={submitNewName}>
        <EditablePreview noOfLines={2} cursor="pointer" />
        <EditableInput placeholder={placeholder} />
      </Editable>
    </Tooltip>
  )
}
