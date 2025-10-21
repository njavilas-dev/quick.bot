import { InputTextWithVariables } from '@/components/inputs'
import { Switch } from '@urbiport/ui'
import { Stack } from '@chakra-ui/react'
import { RedirectBlock } from '@quickbot.io/schemas'
import { defaultRedirectOptions } from '@quickbot.io/schemas/features/blocks/logic/redirect/constants'
import { useTranslate } from '@tolgee/react'
import { FormControl } from '@urbiport/ui'

type Props = {
  options: RedirectBlock['options']
  onOptionsChange: (options: RedirectBlock['options']) => void
}

export const RedirectSettings = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate()

  const handleUrlChange = (url?: string) => onOptionsChange({ ...options, url })

  const handleIsNewTabChange = (isNewTab: boolean) => onOptionsChange({ ...options, isNewTab })

  return (
    <Stack spacing={6}>
      <FormControl label={t('editor.blocks.logic.redirect.settings.url.label')}>
        <InputTextWithVariables
          withVariableButton={true}
          defaultValue={options?.url}
          placeholder={t('editor.blocks.logic.redirect.settings.url.placeholder')}
          onChange={handleUrlChange}
        />
      </FormControl>
      <FormControl
        direction="row"
        label={t('editor.blocks.logic.redirect.settings.isNewTab.label')}
      >
        <Switch
          defaultValue={options?.isNewTab ?? defaultRedirectOptions.isNewTab}
          onChange={handleIsNewTabChange}
        />
      </FormControl>
    </Stack>
  )
}
