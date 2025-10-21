import { Variable } from '@quickbot.io/schemas'
import { SetVariableTag } from '@/features/graph/components/nodes/block/SetVariableTag'

export const SetVariableLabel = ({
  variableId,
  variables,
}: {
  variableId: string
  variables?: Variable[]
}) => {
  const variableName = variables?.find((variable) => variable.id === variableId)?.name

  if (!variableName) return null

   return <SetVariableTag variableName={variableName} />
}
