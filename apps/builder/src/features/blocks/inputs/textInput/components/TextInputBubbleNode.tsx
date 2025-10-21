import React from 'react'
import { VStack, Text } from '@chakra-ui/react'
import { TextInputBlock } from '@quickbot.io/schemas'
import { defaultTextInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/text/constants'
import { useBot } from '@/features/editor/providers/BotProvider'
import { SetVariableLabel } from '@/components/SetVariableLabel'
import { useVariableTag } from '@/hooks/useVariableTag'

type Props = {
  options: TextInputBlock['options']
}

export const TextInputBubbleNode = ({ options }: Props) => {
  const { bot } = useBot()
  const variableTag = useVariableTag(options?.variableId)
  const attachmentVariableId =
    bot && options?.attachments?.isEnabled && options?.attachments.saveVariableId
  const audioClipVariableId =
    bot && options?.audioClip?.isEnabled && options?.audioClip.saveVariableId

  const renderVariableLabels = () => (
    <>
      {attachmentVariableId && (
        <SetVariableLabel variables={bot.variables} variableId={attachmentVariableId} />
      )}
      {audioClipVariableId && (
        <SetVariableLabel variables={bot.variables} variableId={audioClipVariableId} />
      )}
    </>
  )

  return (
    <VStack w="full" align="start" spacing={1}>
      <Text
        color="text.light"
        style={{
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        }}
      >
        {options?.labels?.placeholder ?? defaultTextInputOptions.labels.placeholder}
      </Text>
      {variableTag}
      {renderVariableLabels()}
    </VStack>
  )
}
