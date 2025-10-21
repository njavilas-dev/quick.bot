import React from 'react'
import { Button, HStack, StackProps } from '@chakra-ui/react'

type ButtonSwitchItem = {
  label: string
  value: string
}

type ButtonSwitchProps = {
  selectedItem: string
  onSelect: (value: string) => void
  items: ButtonSwitchItem[]
} & Omit<StackProps, 'onSelect'>

export const ButtonSwitch: React.FC<ButtonSwitchProps> = ({
  selectedItem,
  onSelect,
  items,
  ...props
}) => {
  return (
    <HStack
      spacing="4px"
      border="1px solid"
      borderColor="divider.light"
      p="4px"
      borderRadius="md"
      w="full"
      {...props}
    >
      {items.map(({ label, value }) => (
        <Button
          key={value}
          m={0}
          w="full"
          h="31px"
          backgroundColor={selectedItem === value ? 'black' : 'transparent'}
          color={selectedItem === value ? 'white' : 'black'}
          variant="ghost"
          _hover={{ bg: 'gray.100' }}
          onClick={() => onSelect(value)}
        >
          {label}
        </Button>
      ))}
    </HStack>
  )
}