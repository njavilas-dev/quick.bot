import { Box, Wrap } from '@chakra-ui/react'
import { useBot } from '@/features/editor/providers/BotProvider'
import { SetVariableBlock, Variable } from '@quickbot.io/schemas'
import { byId } from '@quickbot.io/lib'
import { VariableTag } from '@/features/graph/components/nodes/block/VariableTag'
import { PlateText } from '@/features/blocks/bubbles/textBubble/components/plate/PlateText'
import { SetVariableTag } from '@/features/graph/components/nodes/block/SetVariableTag'

export const SetVariableContent = ({ block }: { block: SetVariableBlock }) => {
  const { bot } = useBot()
  const variableName = bot?.variables.find(byId(block.options?.variableId))?.name ?? ''
  return (
    <Box color="text.light" noOfLines={4}>
      {variableName === '' ? (
        'Click to edit...'
      ) : (
        <Expression options={block.options} variables={bot?.variables ?? []} />
      )}
    </Box>
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
    <SetVariableTag variableName={variables.find(byId(options?.variableId))?.name ?? ''} />
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
    case 'Random ID':
    case 'Today':
    case 'Now':
    case 'Tomorrow':
    case 'User ID':
    case 'Result ID':
    case 'Moment of the day':
    case 'Environment name':
    case 'Transcript':
    case 'Yesterday': {
      return (
        <Wrap>
          {variableName} = <VariableTag variableName={`System.${options.type}`} />
        </Wrap>
      )
    }
    case 'Contact name':
    case 'Phone number':
      return (
        <Wrap>
          {variableName} = <VariableTag variableName={`Whatsapp.${options.type}`} />
        </Wrap>
      )
  }
}
