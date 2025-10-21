import React from 'react'
import Link, { LinkProps } from 'next/link'
import { chakra, HStack, TextProps } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@urbiport/icons'

type TextLinkProps = LinkProps & TextProps & { isExternal?: boolean }

export const TextLink = ({
  children,
  href,
  isExternal,
  noOfLines,
  ...textProps
}: TextLinkProps) => {
  if (isExternal) {
    return (
      <chakra.a
        href={href as string}
        target="_blank"
        rel="noopener noreferrer"
        textDecor="underline"
        display="inline-block"
        {...textProps}
      >
        <HStack as="span" spacing={1}>
          <chakra.span noOfLines={noOfLines} maxW="100%">
            {children}
          </chakra.span>
          <ExternalLinkIcon />
        </HStack>
      </chakra.a>
    )
  }

  return (
    <Link href={href} passHref>
      <chakra.a textDecor="underline" display="inline-block" {...textProps}>
        {children}
      </chakra.a>
    </Link>
  )
}
