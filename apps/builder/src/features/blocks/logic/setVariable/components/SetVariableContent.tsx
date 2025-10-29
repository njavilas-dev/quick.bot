import { Box, Wrap, VStack } from '@chakra-ui/react'
import { useBot } from '@/features/editor/providers/BotProvider'
import { SetVariableBlock, Variable, BlockV6 } from '@quickbot.io/schemas'
import { byId } from '@quickbot.io/lib'
import { VariableTag } from '@/features/graph/components/nodes/block/VariableTag'
import { PlateText } from '@/features/blocks/bubbles/textBubble/components/plate/PlateText'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'
import { useIntegrationValidation } from '@/features/graph/hooks/useIntegrationValidation'
import { ValidationMessage } from '@/features/graph/components/nodes/block/ValidationMessage'

export const SetVariableContent = ({ block }: { block: SetVariableBlock }) => {
  const { bot } = useBot()
  const variableName = bot?.variables.find(byId(block.options?.variableId))?.name ?? ''

  // Create a block-like object to validate variables
  const blockForValidation = {
    type: LogicBlockType.SET_VARIABLE,
    options: block.options,
  } as unknown as BlockV6
  const integrationValidation = useIntegrationValidation(blockForValidation)
  const hasValidationErrors = integrationValidation.hasMissingVariablesError

  return (
    <VStack w="full" align="start" spacing={1}>
      <Box color="text.light" noOfLines={4}>
        {variableName === '' ? (
          'Click to edit...'
        ) : (
          <Expression options={block.options} variables={bot?.variables ?? []} />
        )}
      </Box>
      {hasValidationErrors && <ValidationMessage validation={integrationValidation} />}
    </VStack>
  )
}

const Expression = ({
  options,
  variables,
}: {
  options: SetVariableBlock['options']
  variables: Variable[]
}): JSX.Element | null => {
  const variableName = (
    <VariableTag variableName={variables.find(byId(options?.variableId))?.name ?? ''} />
  )
  switch (options?.type) {
    case 'Custom':
    case undefined:
      return (
        <Wrap>
          {variableName} = <PlateText text={options?.expressionToEvaluate ?? ''} />
        </Wrap>
      )
    case 'Map item with same index': {
      const baseItemVariable = variables.find(byId(options.mapListItemParams?.baseItemVariableId))
      const baseListVariable = variables.find(byId(options.mapListItemParams?.baseListVariableId))
      const targetListVariable = variables.find(
        byId(options.mapListItemParams?.targetListVariableId),
      )
      return (
        <Wrap>
          {variableName} = item in ${targetListVariable?.name} with same index as $
          {baseItemVariable?.name} in ${baseListVariable?.name}
        </Wrap>
      )
    }
    case 'Append value(s)': {
      return (
        <Wrap>
          Append {options.item} in {variableName}
        </Wrap>
      )
    }
    case 'Empty':
      return <Wrap>Reset {variableName} </Wrap>
    case 'Shift':
    case 'Pop': {
      const itemVariableName = variables.find(byId(options.saveItemInVariableId))?.name
      return (
        <Wrap>
          {options.type} {variableName}
          {itemVariableName ? ` into ${itemVariableName}` : ''}
        </Wrap>
      )
    }
  }
}
