import { Stack, Wrap, Text } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { byId } from '@quickbot.io/lib'
import { Condition, Variable } from '@quickbot.io/schemas'
import {
  ComparisonOperators,
  defaultConditionItemContent,
} from '@quickbot.io/schemas/features/blocks/logic/condition/constants'
import { VariableTag } from '@/features/graph/components/nodes/block/VariableTag'
import { PlateText } from '@/features/blocks/bubbles/textBubble/components/plate/PlateText'

type Props = {
  condition: Condition | undefined
  variables: Variable[]
  displaySemicolon?: boolean
}
export const ConditionContent = ({
  condition,
  variables,
  displaySemicolon,
}: Props) => {
  const { t } = useTranslate()

  return (
    <Stack>
      {condition?.comparisons?.map((comparison, idx) => {
        const variable = variables.find(byId(comparison.variableId))
        return (
          <Wrap
            key={comparison.id}
            spacing={1}
            noOfLines={1}
            align="center"
          >
            {idx === 0 && (
              <Text>
                {t('blocks.inputs.button.conditionContent.if.label')}
              </Text>
            )}
            {idx > 0 && (
              <Text>
                {condition.logicalOperator ?? defaultConditionItemContent.logicalOperator}
              </Text>
            )}
            {variable?.name && (
              <VariableTag variableName={variable.name} />
            )}
            {comparison.comparisonOperator && (
              <Text>
                {parseComparisonOperatorSymbol(comparison.comparisonOperator)}
              </Text>
            )}
            {comparison?.value &&
              comparison.comparisonOperator !== ComparisonOperators.IS_SET &&
              comparison.comparisonOperator !== ComparisonOperators.IS_EMPTY && (
                <Text display="inline-flex" align="center">
                  <PlateText text={comparison.value} />
                </Text>
              )}
            {idx === (condition.comparisons?.length ?? 0) - 1 && displaySemicolon && (
              <Text>:</Text>
            )}
          </Wrap>
        )
      })}
    </Stack>
  )
}

const parseComparisonOperatorSymbol = (operator: ComparisonOperators): string => {
  switch (operator) {
    case ComparisonOperators.CONTAINS:
      return 'contains'
    case ComparisonOperators.EQUAL:
      return '='
    case ComparisonOperators.GREATER:
      return '>'
    case ComparisonOperators.IS_SET:
      return 'is set'
    case ComparisonOperators.LESS:
      return '<'
    case ComparisonOperators.NOT_EQUAL:
      return '!='
    case ComparisonOperators.ENDS_WITH:
      return 'ends with'
    case ComparisonOperators.STARTS_WITH:
      return 'starts with'
    case ComparisonOperators.IS_EMPTY:
      return 'is empty'
    case ComparisonOperators.NOT_CONTAINS:
      return 'not contains'
    case ComparisonOperators.MATCHES_REGEX:
      return 'matches'
    case ComparisonOperators.NOT_MATCH_REGEX:
      return 'not matches'
  }
}
