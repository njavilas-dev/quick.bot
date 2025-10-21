import { useTranslate } from '@tolgee/react'
import { InputTextWithVariables } from '@/components/inputs'
import { FormControl } from '@urbiport/ui'

type Props = {
  defaultValue?: string
  onChange: (url: string) => void
}

export const EmbedLinkContent = ({ defaultValue, onChange }: Props) => {
  const { t } = useTranslate()

  return (
    <FormControl>
      <InputTextWithVariables
        placeholder={t('editor.header.linkTab.searchInputPlaceholder.label')}
        onChange={onChange}
        defaultValue={defaultValue ?? ''}
      />
    </FormControl>
  )
}
