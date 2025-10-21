import { Stack } from '@chakra-ui/react'
import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import React from 'react'
import { InputTextWithVariables } from '@/components/inputs'
import { ScriptBlock } from '@quickbot.io/schemas'
import { defaultScriptOptions } from '@quickbot.io/schemas/features/blocks/logic/script/constants'
import { FormControl, Switch } from '@urbiport/ui'
import { useTranslate } from '@tolgee/react'

type Props = {
  options: ScriptBlock['options']
  onOptionsChange: (options: ScriptBlock['options']) => void
}

export const ScriptSettings = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate()
  const handleNameChange = (name: string) => onOptionsChange({ ...options, name })

  const handleCodeChange = (content: string) => onOptionsChange({ ...options, content })

  const updateClientExecution = (isExecutedOnClient: boolean) =>
    onOptionsChange({ ...options, isExecutedOnClient })

  return (
    <Stack spacing={6}>
      <FormControl
        direction="row"
        label={t('blocks.logic.script.switch.label')}
        moreInfoTooltip={t('blocks.logic.script.switch.moreInfoTooltip')}
      >
        <Switch
          defaultValue={options?.isExecutedOnClient ?? defaultScriptOptions.isExecutedOnClient}
          onChange={updateClientExecution}
        />
      </FormControl>
      <FormControl label={t('blocks.logic.script.label')}>
        <InputTextWithVariables
          defaultValue={options?.name ?? defaultScriptOptions.name}
          onChange={handleNameChange}
        />
      </FormControl>
      <FormControl label={t('blocks.logic.script.code')}>
        <CodeEditorWithVariables
          withVariableButton={true}
          lang="javascript"
          defaultValue={options?.content}
          onChange={handleCodeChange}
        />
      </FormControl>
    </Stack>
  )
}
