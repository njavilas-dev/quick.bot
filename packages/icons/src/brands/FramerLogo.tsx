import React from 'react'
import { createIcon } from '@chakra-ui/icon'
import { IconComponentType } from '../helpers'

export const FramerLogo: IconComponentType = createIcon({
  displayName: 'FramerLogo',
  viewBox: '0 0 24 24',
  path: (
    <>
      <path d="M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z" />
    </>
  ),
})
