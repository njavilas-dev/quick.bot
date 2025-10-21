import React from 'react'
import { Select } from '@urbiport/ui'
import { currencies } from '../currencies'

type Props = {
  currency?: string
  onSelect: (currency: string) => void
}

type CurrencyItem = (typeof currencies)[number];

export const CurrencySelect = ({ currency, onSelect }: Props) => {
  return (
    <Select<CurrencyItem>
      withClear={false}
      placeholder="Currency"
      selectedItem={currency}
      onSelect={onSelect}
      items={currencies}
    />
  )
}
