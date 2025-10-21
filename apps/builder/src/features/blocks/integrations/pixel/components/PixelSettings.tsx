import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import { TableList } from '@/components/TableList'
import { TextLink } from '@/components/TextLink'
import { InputTextWithVariables } from '@/components/inputs'
import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { Stack, Text } from '@chakra-ui/react'
import { isDefined, isEmpty } from '@quickbot.io/lib'
import { PixelBlock } from '@quickbot.io/schemas'
import {
  defaultPixelOptions,
  pixelEventTypes,
  pixelObjectProperties,
} from '@quickbot.io/schemas/features/blocks/integrations/pixel/constants'
import React from 'react'
import { useTranslate } from '@tolgee/react'
import { Select, Switch, FormControl } from '@urbiport/ui'

const pixelReferenceUrl =
  'https://developers.facebook.com/docs/meta-pixel/reference#standard-events'

type Props = {
  options?: PixelBlock['options']
  onOptionsChange: (options: PixelBlock['options']) => void
}

type Item = NonNullable<NonNullable<PixelBlock['options']>['params']>[number]

export const PixelSettings = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate()

  const updateIsInitSkipped = (isChecked: boolean) =>
    onOptionsChange({
      ...options,
      isInitSkip: isChecked,
    })

  const updatePixelId = (pixelId: string) =>
    onOptionsChange({
      ...options,
      pixelId: isEmpty(pixelId) ? undefined : pixelId,
    })

  const updateIsTrackingEventEnabled = (isChecked: boolean) =>
    onOptionsChange({
      ...options,
      params: isChecked && !options?.params ? [] : undefined,
    })

  const updateEventType = (eventType?: (typeof pixelEventTypes)[number] | 'Custom') => {
    onOptionsChange({
      ...options,
      params: [],
      eventType,
    })
  }

  const updateParams = (params: NonNullable<PixelBlock['options']>['params']) =>
    onOptionsChange({
      ...options,
      params,
    })

  const updateEventName = (name: string) => {
    if (options?.eventType !== 'Custom') return
    onOptionsChange({
      ...options,
      name: isEmpty(name) ? undefined : name,
    })
  }

  return (
    <Stack spacing={6}>
      <FormControl>
        <InputTextWithVariables
          defaultValue={options?.pixelId ?? ''}
          onChange={updatePixelId}
          placeholder={t('editor.blocks.integrations.pixel.settings.pixelId.placeholder')}
        />
      </FormControl>
      <FormControl
        direction="row"
        label={t('editor.blocks.integrations.pixel.settings.skipInitialization.label')}
        moreInfoTooltip={t('editor.blocks.integrations.pixel.settings.skipInitialization.tooltip')}
      >
        <Switch
          defaultValue={options?.isInitSkip ?? defaultPixelOptions.isInitSkip}
          onChange={updateIsInitSkipped}
        />
      </FormControl>
      <SwitchWithRelatedSettings
        label={t('editor.blocks.integrations.pixel.settings.trackEvent.label')}
        defaultValue={isDefined(options?.params)}
        onChange={updateIsTrackingEventEnabled}
      >
        <Text fontSize="sm" color="text.light">
          {t('editor.blocks.integrations.pixel.settings.trackEvent.info')}{' '}
          <TextLink href={pixelReferenceUrl} isExternal>
            {t('editor.blocks.integrations.pixel.settings.trackEvent.referenceLink')}
          </TextLink>{' '}
          {t('editor.blocks.integrations.pixel.settings.trackEvent.infoSuffix')}
        </Text>
        <Select
          items={['Custom', ...pixelEventTypes] as const}
          selectedItem={options?.eventType}
          placeholder={t('editor.blocks.integrations.pixel.settings.eventType.placeholder')}
          onSelect={updateEventType}
        />
        {options?.eventType === 'Custom' && (
          <FormControl>
            <InputTextWithVariables
              defaultValue={options.name ?? ''}
              onChange={updateEventName}
              placeholder={t('editor.blocks.integrations.pixel.settings.eventName.placeholder')}
            />
          </FormControl>
        )}
        {options?.eventType &&
          (options.eventType === 'Custom' ||
            pixelObjectProperties.filter((prop) =>
              prop.associatedEvents.includes(options.eventType),
            ).length > 0) && (
            <TableList
              initialItems={options?.params ?? []}
              onItemsChange={updateParams}
              addLabel={t('editor.blocks.integrations.pixel.settings.params.addLabel')}
            >
              {(props) => <ParamItem {...props} eventType={options?.eventType} />}
            </TableList>
          )}
      </SwitchWithRelatedSettings>
    </Stack>
  )
}

type ParamItemProps = {
  item: Item
  eventType: 'Custom' | (typeof pixelEventTypes)[number] | undefined
  onItemChange: (item: Item) => void
}

const ParamItem = ({ item, eventType, onItemChange }: ParamItemProps) => {
  const { t } = useTranslate()

  const possibleObjectProps =
    eventType && eventType !== 'Custom'
      ? pixelObjectProperties.filter((prop) => prop.associatedEvents.includes(eventType))
      : []

  const currentObject = possibleObjectProps.find((prop) => prop.key === item.key)

  const updateKey = (key: string) =>
    onItemChange({
      ...item,
      key,
    })

  const updateValue = (value: string) =>
    onItemChange({
      ...item,
      value,
    })

  if (!eventType) return null

  return (
    <Stack p="4" borderRadius="md" flex="1" borderWidth="1px">
      <FormControl>
        {eventType === 'Custom' ? (
          <InputTextWithVariables
            defaultValue={item.key}
            onChange={updateKey}
            placeholder={t('editor.blocks.integrations.pixel.settings.param.key.placeholder')}
          />
        ) : (
          <Select
            selectedItem={item.key ?? ''}
            items={possibleObjectProps.map((prop) => prop.key)}
            onSelect={updateKey}
            placeholder={t(
              'editor.blocks.integrations.pixel.settings.param.key.dropdownPlaceholder',
            )}
          />
        )}
      </FormControl>
      <FormControl>
        {currentObject?.type === 'code' ? (
          <CodeEditorWithVariables
            withVariableButton={true}
            lang="javascript"
            defaultValue={item.value}
            onChange={updateValue}
          />
        ) : (
          <InputTextWithVariables
            defaultValue={item.value}
            onChange={updateValue}
            placeholder={t('editor.blocks.integrations.pixel.settings.param.value.placeholder')}
          />
        )}
      </FormControl>
    </Stack>
  )
}
