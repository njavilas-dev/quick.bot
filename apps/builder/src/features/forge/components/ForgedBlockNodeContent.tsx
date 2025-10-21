import { SetVariableLabel } from '@/components/SetVariableLabel'
import { useBot } from '@/features/editor/providers/BotProvider'
import { Flex, Stack, Text, Tooltip } from '@chakra-ui/react'
import { useForgedBlock } from '../hooks/useForgedBlock'
import { ForgedBlock } from '@quickbot.io/forge-repository/types'
import { BlockIndices } from '@quickbot.io/schemas'
import { useMemo } from 'react'
import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { ThunderIcon } from '@urbiport/icons'
import { useIntegrationValidation } from '../../../features/graph/hooks/useIntegrationValidation'

type Props = {
  block: ForgedBlock
  indices: BlockIndices
}
export const ForgedBlockNodeContent = ({ block, indices }: Props) => {
  const { blockDef, actionDef } = useForgedBlock(block.type, block.options?.action)
  const { bot } = useBot()
  const integrationValidation = useIntegrationValidation(block)

  const isStreamingNextBlock = useMemo(() => {
    if (!actionDef?.run?.stream?.getStreamVariableId) return false
    const variable = bot?.variables.find(
      (variable) => variable.id === actionDef.run!.stream!.getStreamVariableId(block.options),
    )
    if (!variable) return false
    const nextBlock = bot?.groups[indices.groupIndex]?.blocks[indices.blockIndex + 1]
    return (
      nextBlock?.type === BubbleBlockType.TEXT &&
      nextBlock.content?.richText?.length === 1 &&
      nextBlock.content.richText[0].type === 'p' &&
      nextBlock.content.richText[0].children.length === 1 &&
      nextBlock.content.richText[0].children[0].text === `{{${variable.name}}}`
    )
  }, [
    actionDef?.run,
    block.options,
    indices.blockIndex,
    indices.groupIndex,
    bot?.groups,
    bot?.variables,
  ])

  const setVariableIds = actionDef?.getSetVariableIds?.(block.options) ?? []

  const isConfigured = block.options?.action && (!blockDef?.auth || block.options.credentialsId)
  const hasValidationErrors =
    integrationValidation.hasCredentialsError || integrationValidation.hasRequiredFieldsError

  return (
    <Stack>
      <Text
        color={hasValidationErrors ? 'red.600' : isConfigured ? 'currentcolor' : 'text.light'}
        noOfLines={1}
      >
        {isConfigured ? block.options.action : 'Configure...'}
      </Text>
      {hasValidationErrors && (
        <Text fontSize="xs" color="red.500" noOfLines={1}>
          {integrationValidation.errors[0]}
        </Text>
      )}
      {bot &&
        isConfigured &&
        setVariableIds.map((variableId, idx) => (
          <SetVariableLabel
            key={variableId + idx}
            variables={bot.variables}
            variableId={variableId}
          />
        ))}
      {isStreamingNextBlock && (
        <Tooltip label="Text bubble content will be streamed">
          <Flex
            borderRadius="full"
            p="1"
            bgColor="gray.100"
            color="brand.purple"
            borderWidth={1}
            pos="absolute"
            bottom="-15px"
            left="118px"
            zIndex={10}
          >
            <ThunderIcon fontSize="sm" />
          </Flex>
        </Tooltip>
      )}
    </Stack>
  )
}
