import React from 'react'
import { IconButton, IconButtonProps } from '@chakra-ui/react'
import { useLinkToolbarButton, useLinkToolbarButtonState } from '@udecode/plate-link'

type Props = IconButtonProps

export const LinkToolbarButton = ({ ...rest }: Props) => {
  const state = useLinkToolbarButtonState()
  const { props: buttonProps } = useLinkToolbarButton(state)

  const isActive = !!buttonProps.pressed;
  const onClick = buttonProps.onClick;

  return (
    <IconButton
      size="sm"
      variant={isActive ? 'outline' : 'ghost'}
      colorScheme={isActive ? 'blue' : undefined}
      aria-pressed={isActive ? 'true' : 'false'}
      onClick={onClick}
      {...rest}
    />
  )
}
