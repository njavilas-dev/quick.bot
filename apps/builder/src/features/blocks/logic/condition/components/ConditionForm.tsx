import { Comparison, Condition } from '@quickbot.io/schemas'
import React from 'react'
import { ComparisonItem } from './ComparisonItem'
import { TableList } from '@/components/TableList'
import {
  LogicalOperator,
  defaultConditionItemContent,
} from '@quickbot.io/schemas/features/blocks/logic/condition/constants'
import { useTranslate } from '@tolgee/react'
import { FormControl, Select, Box } from '@urbiport/ui'

type Props = {
  condition: Condition | undefined
  onConditionChange: (newCondition: Condition) => void
}

export const ConditionForm = ({ condition, onConditionChange }: Props) => {
  const { t } = useTranslate()
  const handleComparisonsChange = (comparisons: Comparison[]) =>
    onConditionChange({ ...condition, comparisons })
  const handleLogicalOperatorChange = (logicalOperator: LogicalOperator) =>
    onConditionChange({ ...condition, logicalOperator })

  return (
    <Box mt="20px">
      <TableList<Comparison>
        initialItems={condition?.comparisons}
        onItemsChange={handleComparisonsChange}
        ComponentBetweenItems={() => (
          <FormControl>
            <Select
              selectedItem={
                condition?.logicalOperator ?? defaultConditionItemContent.logicalOperator
              }
              onSelect={handleLogicalOperatorChange}
              items={Object.values(LogicalOperator)}
            />
          </FormControl>
        )}
        addLabel={t('blocks.inputs.button.buttonSettings.addComparisonButton.label')}
      >
        {(props) => <ComparisonItem {...props} />}
      </TableList>
    </Box>
  )
}
