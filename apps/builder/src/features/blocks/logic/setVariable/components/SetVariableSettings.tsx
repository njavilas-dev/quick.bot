import { Alert, AlertIcon, Stack, Tag, Text } from '@chakra-ui/react'
import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { SetVariableBlock, Variable } from '@quickbot.io/schemas'

import { FormControl, Switch } from '@urbiport/ui'
import { Select } from '@urbiport/ui'
import { WhatsAppLogo } from '@urbiport/icons'
import {
  defaultSetVariableOptions,
  hiddenTypes,
  sessionOnlySetVariableOptions,
  valueTypes,
} from '@quickbot.io/schemas/features/blocks/logic/setVariable/constants'
import { InputTextWithVariables, TextareaWithVariables } from '@/components/inputs'
import { isDefined } from '@quickbot.io/lib'
import { useBot } from '@/features/editor/providers/BotProvider'
import { isInputBlock } from '@quickbot.io/schemas/helpers'
import { RadioButtons } from '@urbiport/ui'
import { useTranslate } from '@tolgee/react'
import { VariablesDropdown } from '@/features/variables/components/VariablesDropdown'

type Props = {
  options: SetVariableBlock['options']
  onOptionsChange: (options: SetVariableBlock['options']) => void
}

const setVarTypes = valueTypes.filter(
  (type) => !hiddenTypes.includes(type as (typeof hiddenTypes)[number]),
)

export const SetVariableSettings = ({ options, onOptionsChange }: Props) => {
  const { bot, updateVariable } = useBot()
  const { t } = useTranslate()
  const selectedVariable = bot?.variables.find((variable) => variable.id === options?.variableId)

  const updateVariableId = (variable?: Pick<Variable, 'id'>) =>
    onOptionsChange({
      ...options,
      variableId: variable?.id,
    })

  const updateValueType = (type?: string) =>
    onOptionsChange({
      ...options,
      type: type as NonNullable<SetVariableBlock['options']>['type'],
    })

  const updateIsSavedVariable = (isSavedVariable: boolean) => {
    if (!selectedVariable?.id) return
    updateVariable(selectedVariable.id, {
      isSavedVariable: isSavedVariable,
    })
  }

  const isSessionOnly =
    options?.type &&
    sessionOnlySetVariableOptions.includes(
      options.type as (typeof sessionOnlySetVariableOptions)[number],
    )

  const isLinkedToAnswer =
    options?.variableId &&
    bot?.groups.some((g) =>
      g.blocks.some((b) => isInputBlock(b) && b.options?.variableId === options.variableId),
    )

  return (
    <Stack spacing={6}>
      <FormControl>
        <VariablesDropdown onSelect={updateVariableId} initialVariableId={options?.variableId} />
      </FormControl>
      <FormControl label={t('blocks.logic.variables.value')}>
        <Select
          selectedItem={options?.type ?? defaultSetVariableOptions.type}
          items={setVarTypes.map((type) => ({
            label: type,
            value: type,
            icon: type === 'Contact name' || type === 'Phone number' ? <WhatsAppLogo /> : undefined,
          }))}
          onSelect={updateValueType}
        />
      </FormControl>
      {selectedVariable && !isSessionOnly && !isLinkedToAnswer && (
        <FormControl
          direction='row'
          label={t('blocks.logic.variables.saveInResults.label')}
          moreInfoTooltip={t('blocks.logic.variables.saveInResults.tooltip')}
        >
          <Switch
            key={selectedVariable.id}
            defaultValue={selectedVariable.isSavedVariable}
            onChange={updateIsSavedVariable}
          />
        </FormControl>
      )}
      <SetVariableValue options={options} onOptionsChange={onOptionsChange} t={t} />
    </Stack>
  )
}

const SetVariableValue = ({
  options,
  onOptionsChange,
  t,
}: {
  options: SetVariableBlock['options']
  onOptionsChange: (options: SetVariableBlock['options']) => void
  t: (key: string) => string
}): JSX.Element | null => {
  const updateExpression = (expressionToEvaluate: string) =>
    onOptionsChange({
      ...options,
      type: isDefined(options?.type) ? 'Custom' : undefined,
      expressionToEvaluate,
    })

  const updateClientExecution = (isExecutedOnClient: boolean) =>
    onOptionsChange({
      ...options,
      isExecutedOnClient,
    })

  const updateListVariableId = (variable?: Pick<Variable, 'id'>) => {
    if (!options || (options.type !== 'Pop' && options.type !== 'Shift')) return
    onOptionsChange({
      ...options,
      saveItemInVariableId: variable?.id,
    })
  }

  const updateItemVariableId = (variable?: Pick<Variable, 'id'>) => {
    if (!options || options.type !== 'Map item with same index') return
    onOptionsChange({
      ...options,
      mapListItemParams: {
        ...options.mapListItemParams,
        baseItemVariableId: variable?.id,
      },
    })
  }

  const updateBaseListVariableId = (variable?: Pick<Variable, 'id'>) => {
    if (!options || options.type !== 'Map item with same index') return
    onOptionsChange({
      ...options,
      mapListItemParams: {
        ...options.mapListItemParams,
        baseListVariableId: variable?.id,
      },
    })
  }

  const updateTargetListVariableId = (variable?: Pick<Variable, 'id'>) => {
    if (!options || options.type !== 'Map item with same index') return
    onOptionsChange({
      ...options,
      mapListItemParams: {
        ...options.mapListItemParams,
        targetListVariableId: variable?.id,
      },
    })
  }

  const updateItem = (item: string) => {
    if (!options || options.type !== 'Append value(s)') return
    onOptionsChange({
      ...options,
      item,
    })
  }

  const updateIsCode = (radio: 'Text' | 'Code') => {
    if (options?.type && options.type !== 'Custom') return
    onOptionsChange({
      ...options,
      isCode: radio === 'Code',
    })
  }

  switch (options?.type) {
    case 'Custom':
    case undefined:
      return (
        <>
          <FormControl
            direction="row"
            label={t('blocks.logic.variables.executeOnClient.label')}
            moreInfoTooltip={t('blocks.logic.variables.executeOnClient.tooltip')}
          >
            <Switch
              defaultValue={
                options?.isExecutedOnClient ?? defaultSetVariableOptions.isExecutedOnClient
              }
              onChange={updateClientExecution}
            />
          </FormControl>
          <FormControl>
            <RadioButtons
              options={['Text', 'Code']}
              defaultValue={options?.isCode ?? defaultSetVariableOptions.isCode ? 'Code' : 'Text'}
              onSelect={(newValue) => updateIsCode(newValue as 'Text' | 'Code')}
            />
          </FormControl>
          <FormControl>
            {options?.isCode ? (
              <CodeEditorWithVariables
                withVariableButton={true}
                lang="javascript"
                defaultValue={options?.expressionToEvaluate ?? ''}
                onChange={updateExpression}
              />
            ) : (
              <TextareaWithVariables
                withVariableButton={true}
                defaultValue={options?.expressionToEvaluate ?? ''}
                onChange={updateExpression}
                width="full"
              />
            )}
          </FormControl>
        </>
      )
    case 'Pop':
    case 'Shift':
      return (
        <FormControl>
          <VariablesDropdown
            initialVariableId={options.saveItemInVariableId}
            onSelect={updateListVariableId}
            placeholder={t(`blocks.logic.variables.${options.type}.placeholder`)}
          />
        </FormControl>
      )
    case 'Map item with same index': {
      return (
        <Stack p="2" borderRadius="md" borderWidth={1}>
          <FormControl>
            <VariablesDropdown
              initialVariableId={options.mapListItemParams?.baseItemVariableId}
              onSelect={updateItemVariableId}
              placeholder={t('blocks.logic.variables.map.baseItem.placeholder')}
            />
          </FormControl>
          <FormControl>
            <VariablesDropdown
              initialVariableId={options.mapListItemParams?.baseListVariableId}
              onSelect={updateBaseListVariableId}
              placeholder={t('blocks.logic.variables.map.baseList.placeholder')}
            />
          </FormControl>
          <FormControl>
            <VariablesDropdown
              initialVariableId={options.mapListItemParams?.targetListVariableId}
              onSelect={updateTargetListVariableId}
              placeholder={t('blocks.logic.variables.map.targetList.placeholder')}
            />
          </FormControl>
        </Stack>
      )
    }
    case 'Append value(s)': {
      return (
        <FormControl>
          <TextareaWithVariables
            withVariableButton={true}
            defaultValue={options.item}
            onChange={updateItem}
          />
        </FormControl>
      )
    }
    case 'Moment of the day': {
      return (
        <Alert>
          <AlertIcon />
          <Text>
            {t('blocks.logic.variables.switch.moment.1')}{' '}
            <Tag>{t('blocks.logic.variables.switch.moment.2')}</Tag>,{' '}
            <Tag>{t('blocks.logic.variables.switch.moment.3')}</Tag>,{' '}
            <Tag>{t('blocks.logic.variables.switch.moment.4')}</Tag>{' '}
            {t('blocks.logic.variables.switch.moment.5')}{' '}
            <Tag>{t('blocks.logic.variables.switch.moment.6')}</Tag>{' '}
            {t('blocks.logic.variables.switch.moment.7')}{' '}
          </Text>
        </Alert>
      )
    }
    case 'Environment name': {
      return (
        <Alert>
          <AlertIcon />
          <Text>
            {t('blocks.logic.variables.switch.whatsapp.1')}{' '}
            <Tag>{t('blocks.logic.variables.switch.whatsapp.2')}</Tag>{' '}
            {t('blocks.logic.variables.switch.whatsapp.3')}{' '}
            <Tag>{t('blocks.logic.variables.switch.whatsapp.4')}</Tag>.
          </Text>
        </Alert>
      )
    }
    case 'Now':
    case 'Yesterday':
    case 'Tomorrow': {
      return (
        <FormControl direction="row" label={t('blocks.logic.variables.now.timezone.label')}>
          <InputTextWithVariables
            withVariableButton={true}
            onChange={(timeZone) => onOptionsChange({ ...options, timeZone })}
            defaultValue={options.timeZone}
            placeholder={t('blocks.logic.variables.now.timezone.placeholder')}
          />
        </FormControl>
      )
    }
    case 'Contact name':
    case 'Phone number':
    case 'Random ID':
    case 'User ID':
    case 'Today':
    case 'Result ID':
    case 'Empty':
    case 'Transcript':
      return null
  }
}
