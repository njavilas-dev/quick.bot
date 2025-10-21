import { Flex } from '@chakra-ui/react'
import React from 'react'

type Props = {
  isVisible: boolean
  isExpanded: boolean
  onRef: (ref: HTMLDivElement) => void
}

export const PlaceholderNode = ({ isVisible, isExpanded, onRef }: Props) => {
  return (
    <Flex
      ref={onRef}
      h={isExpanded ? '50px' : '2px'}
      bgColor="bg.hover"
      visibility={isVisible ? 'visible' : 'hidden'}
      borderRadius="md"
      transition={isVisible ? 'height 200ms' : 'none'}
    />
  )
}
