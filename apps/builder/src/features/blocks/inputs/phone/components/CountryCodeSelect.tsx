import React from 'react'
import { Select } from '@urbiport/ui'
import { useTranslate } from '@tolgee/react'
import { countries } from './countries'

type Props = {
  countryCode?: string
  onSelect: (countryCode: string) => void
}

type ContryItem = (typeof countries)[number];

export const CountryCodeSelect = ({ countryCode, onSelect }: Props) => {
  const { t } = useTranslate()
  return (
    <Select<ContryItem>
      withClear={false}
      placeholder={t('blocks.inputs.phone.settings.international.placeholder.label')}
      selectedItem={countryCode}
      onSelect={onSelect}
      items={countries}
    />
  )
}
