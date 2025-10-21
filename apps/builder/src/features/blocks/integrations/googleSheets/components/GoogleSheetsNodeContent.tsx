import React from 'react'
import { Stack, Text } from '@chakra-ui/react'
import { useBot } from '@/features/editor/providers/BotProvider'
import { SetVariableLabel } from '@/components/SetVariableLabel'
import { GoogleSheetsBlock } from '@quickbot.io/schemas'
import { GoogleSheetsAction } from '@quickbot.io/schemas/features/blocks/integrations/googleSheets/constants'
import { useIntegrationValidation } from '@/features/graph/hooks/useIntegrationValidation'

type Props = {
  options?: GoogleSheetsBlock['options']
}

export const GoogleSheetsNodeContent = ({ options }: Props) => {
  const { bot } = useBot()
  const integrationValidation = useIntegrationValidation({
    type: 'Google Sheets',
    options,
  } as GoogleSheetsBlock)
  const hasValidationErrors = integrationValidation.hasRequiredFieldsError

  return (
    <Stack>
      <Text
        color={options?.action ? 'currentcolor' : hasValidationErrors ? 'red.600' : 'text.light'}
        noOfLines={1}
      >
        {options?.action ?? 'Configure...'}
      </Text>
      {hasValidationErrors && (
        <Text fontSize="xs" color="red.500" noOfLines={1}>
          {integrationValidation.errors[0]}
        </Text>
      )}
      {bot &&
        options?.action === GoogleSheetsAction.GET &&
        options?.cellsToExtract
          ?.map((mapping) => mapping.variableId)
          .map((variableId, idx) =>
            variableId ? (
              <SetVariableLabel
                key={variableId + idx}
                variables={bot.variables}
                variableId={variableId}
              />
            ) : null,
          )}
    </Stack>
  )
}
