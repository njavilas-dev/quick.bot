import React from 'react'
import { PlusIcon, MinusIcon } from '@urbiport/icons'

export const ControlPillIcon = ({ isOpen }: { isOpen: boolean | undefined }) => {
  return isOpen ? <MinusIcon /> : <PlusIcon />
}
