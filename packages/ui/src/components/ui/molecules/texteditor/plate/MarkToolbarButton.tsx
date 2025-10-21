import React from 'react'
import { useMarkToolbarButton, useMarkToolbarButtonState } from '@udecode/plate-common'
import { IconButton, IconButtonProps } from '@chakra-ui/react'

type Props = {
  nodeType: string
  clear?: string | string[]
} & Omit<IconButtonProps, 'aria-label'>

export const MarkToolbarButton = ({ clear, nodeType, ...rest }: Props) => {
  const state = useMarkToolbarButtonState({ clear, nodeType })
  const { props: buttonProps } = useMarkToolbarButton(state)

  const isActive = !!buttonProps.pressed;
  const onClick = buttonProps.onClick;
  const onMouseDown = buttonProps.onMouseDown;

  return (
    <IconButton
      size="sm"
      variant={isActive ? 'outline' : 'ghost'}
      colorScheme={isActive ? 'blue' : undefined}
      aria-pressed={isActive ? 'true' : 'false'}
      onClick={onClick}
      onMouseDown={onMouseDown}
      {...rest}
      aria-label=""
    />
  )
}
