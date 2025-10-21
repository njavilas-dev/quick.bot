import React from 'react'
import { HStack, RadioGroupProps, RadioProps, useRadioGroup } from '@chakra-ui/react'

export const RadioGroupCard = (props: RadioGroupProps) => {
  const { getRootProps, getRadioProps, value } = useRadioGroup(props)

  const group = getRootProps()

  return (
    <HStack
      {...group}
      borderColor="black"
      borderStyle="solid"
      borderWidth="1px"
      borderRadius="md"
      px={1}
      py={1}
    >
      {React.Children.map(props.children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, {
            isChecked: child.props.value === value,
            ...getRadioProps({ value: child.props.value }),
          } as RadioProps)
          : child,
      )}
    </HStack>
  )
}
