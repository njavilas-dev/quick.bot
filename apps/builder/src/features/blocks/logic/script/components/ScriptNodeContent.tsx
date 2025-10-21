import React from 'react'
import { Text } from '@chakra-ui/react'
import { ScriptBlock } from '@quickbot.io/schemas'
import { defaultScriptOptions } from '@quickbot.io/schemas/features/blocks/logic/script/constants'

type Props = {
  options: ScriptBlock['options']
}

export const ScriptNodeContent = ({ options: { name, content } = {} }: Props) => (
  <Text color={content ? 'currentcolor' : 'text.light'} noOfLines={1}>
    {content ? `Run ${name ?? defaultScriptOptions.name}` : 'Configure...'}
  </Text>
)
