import React from 'react'
import { Tooltip, chakra } from '@chakra-ui/react'
import { HelpCircleIcon } from '@urbiport/icons'

type Props = {
  children: React.ReactNode
}

export const MoreInfoTooltip = ({ children }: Props) => {
  return (
    <Tooltip label={children} hasArrow rounded="md" p="3" placement="top">
      <chakra.span cursor="pointer" display="flex" alignItems="center" justifyContent="center">
        <HelpCircleIcon fontSize="15px" />
      </chakra.span>
    </Tooltip>
  )
}
