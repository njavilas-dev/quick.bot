import React from 'react'
import { BoxCard, FormControl, FormControlProps, Switch, SwitchWithLabelProps } from '@urbiport/ui'
import { VStack } from '@chakra-ui/react'

type Props = SwitchWithLabelProps & Pick<FormControlProps, 'label' | 'helperText' | 'moreInfoTooltip' | 'direction' | 'children'>

export const SwitchWithRelatedSettings = ({
  label,
  helperText,
  moreInfoTooltip,
  direction = 'row',
  children,
  boxPadding = 3,
  boxMargin = 0,
  isVisible = false,
  withBorders = true,
  ...props
}: Props) => (
  <BoxCard as={VStack} gap={4} padding={boxPadding} margin={boxMargin} withBorders={withBorders}>
    <FormControl
      label={label}
      helperText={helperText}
      moreInfoTooltip={moreInfoTooltip}
      direction={direction}
    >
      <Switch {...props} />
    </FormControl>
    {(isVisible || props.defaultValue) && (
      <VStack
        gap={3}
        width="full"
        opacity={props.defaultValue ? 1 : 0.5}
        pointerEvents={props.defaultValue ? 'auto' : 'none'}
        borderRadius="md"
      >
        {children}
      </VStack>
    )}
  </BoxCard>
)
