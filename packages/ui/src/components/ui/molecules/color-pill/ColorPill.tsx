import React from 'react'
import { Box, Image } from '@chakra-ui/react'
import { ProhibitedIcon } from '@urbiport/icons'

type ColorPillProps = {
  color?: string,
  borderRadius?: string | number,
}

export const ColorPill = ({ color, ...props }: ColorPillProps) => {

  if (color === 'none' || !color) {
    return <ProhibitedIcon color="gray.200" {...props} />
  }

  const isAnImageUrl = color?.startsWith('http')

  if (isAnImageUrl) {
    return <Image src={color} h="14px" w="14px" rounded="full" border="1px solid" borderColor="gray.200"  {...props} />
  }

  return <Box w="14px" h="14px" bg={color} borderRadius="50%" border="1px solid" borderColor="gray.200"  {...props} />

}
