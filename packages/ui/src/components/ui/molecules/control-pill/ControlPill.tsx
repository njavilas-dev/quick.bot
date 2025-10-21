import React from 'react'
import { Button, Spacer, Text } from '@chakra-ui/react'
import { MoreInfoTooltip } from '../more-info-tooltip'
import { ColorPill } from '../color-pill'
import { ControlPillIcon } from '../control-pill-icon'

type ControlPillProps = {
  pill?: string
  label: string
  hasPopover?: boolean
  isOpen?: boolean | undefined
  buttonTooltip?: React.ReactNode
  onClick?: () => void
}

export const ControlPill = ({ pill, label, hasPopover, isOpen, buttonTooltip, ...props }: ControlPillProps) => {
  return (
    <Button
      w="full"
      size="md"
      leftIcon={pill ? <ColorPill color={pill} /> : undefined}
      rightIcon={hasPopover ? <ControlPillIcon isOpen={isOpen} /> : undefined}
      variant="outline"
      display="flex"
      gap="1"
      m={0}
      sx={{
        span: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }
      }}
      {...props}
    >
      <Text color="text.light" fontSize="sm">
        {label}
      </Text>
      <Spacer />
      {buttonTooltip && <MoreInfoTooltip>{buttonTooltip}</MoreInfoTooltip>}
    </Button>
  )
}
