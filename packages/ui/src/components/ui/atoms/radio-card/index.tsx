import React, { ReactNode } from 'react'
import { Box, Flex, useRadio, UseRadioProps, useStyleConfig } from '@chakra-ui/react'

type RadioCardProps = UseRadioProps & {
  children: ReactNode
  size?: 'md' | 'sm'
}

export const RadioCard = ({ children, ...props }: RadioCardProps) => {
  const { getInputProps, getRadioProps } = useRadio(props)

  const input = getInputProps()
  const checkbox = getRadioProps()
  const buttonStyles = useStyleConfig('Button', { variant: 'outline' })

  return (
    <Box as="label" flex="1">
      <input {...input} />
      <Flex
        {...checkbox}
        aria-checked={props.isChecked}
        sx={buttonStyles}
        cursor="pointer"
        height="36px"
        justifyContent="flex-start"
        alignItems="center"
      >
        {children}
      </Flex>
    </Box>
  )
}

RadioCard.displayName = 'RadioCard'
