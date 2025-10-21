import { IconComponentType, RobotIcon } from '@urbiport/icons'
import React from 'react'
import { chakra, Image, Box } from '@chakra-ui/react'
import { isSvgSrc } from '@quickbot.io/lib'

export type BotIconProps = {
  icon?: string | IconComponentType | null
  name?: string
  size?: string
}

export const BotIcon = ({ icon, name, size = '40px' }: BotIconProps) => {
  if (typeof icon === 'string' && (icon.startsWith('http') || isSvgSrc(icon))) {
    return (
      <Image
        src={icon}
        width={size}
        height={size}
        objectFit={isSvgSrc(icon) ? undefined : 'cover'}
        alt="Bot icon"
        borderRadius="10%"
      />
    )
  }

  if (typeof icon === 'string') {
    return (
      <chakra.span role="img" fontSize={`calc(${size} * 0.666)`}>
        {icon}
      </chakra.span>
    )
  }

  if (name) {
    return (
      <Box
        bg="brand.primary"
        color="black"
        borderRadius="md"
        display="flex"
        alignItems="center"
        justifyContent="center"
        width={`calc(${size} * 0.666)`}
        height={`calc(${size} * 0.666)`}
        fontWeight="bold"
        fontSize="lg"
      >
        {name.charAt(0).toUpperCase()}
      </Box>
    )
  }

  if (icon) {
    const Icon = icon
    return <Icon />
  }

  return <RobotIcon />
}
