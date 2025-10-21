import React from 'react'
import {
  Button,
  HStack,
  Popover,
  PopoverContent,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { FormControl } from '@urbiport/ui'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import { ConditionForm } from '@/features/blocks/logic/condition/components/ConditionForm'
import { ButtonItem, Condition } from '@quickbot.io/schemas'
import { ImageUploadContent } from '@/components/ImageUploadContent'
import { LogicalOperator } from '@quickbot.io/schemas/features/blocks/logic/condition/constants'
import { useTranslate } from '@tolgee/react'
import { InputTextWithVariables } from '@/components/inputs/InputTextWithVariables'
import { TextareaWithVariables } from '@/components/inputs'
import { CloseIcon } from '@urbiport/icons'

type Props = {
  workspaceId: string
  botId: string
  blockId: string
  item: ButtonItem
  onSettingsChange: (updates: Omit<ButtonItem, 'content'>) => void
}

export const ButtonsBubbleItemForm = ({
  workspaceId,
  botId,
  blockId,
  item,
  onSettingsChange,
}: Props) => {
  const { t } = useTranslate()
  const { isOpen, onToggle, onClose } = useDisclosure()

  const updateTitle = (title: string) => onSettingsChange({ ...item, title })

  const updateImage = (pictureSrc: string) => {
    onSettingsChange({ ...item, pictureSrc })
  }

  const updateDescription = (description: string) => onSettingsChange({ ...item, description })

  const updateIsDisplayConditionEnabled = (isEnabled: boolean) =>
    onSettingsChange({
      ...item,
      displayCondition: {
        ...item.displayCondition,
        isEnabled,
      },
    })

  const updateDisplayCondition = (condition: Condition) =>
    onSettingsChange({
      ...item,
      displayCondition: {
        ...item.displayCondition,
        condition,
      },
    })

  const updateButtonValue = (value: string) => {
    if (value === '') {
      onSettingsChange({
        ...item,
        title: undefined,
        value: undefined,
      })
    } else {
      onSettingsChange({
        ...item,
        title: item.content,
        value,
      })
    }
  }

  const removeImage = () => {
    onSettingsChange({
      ...item,
      pictureSrc: undefined,
      title: undefined,
      description: undefined,
    })
  }

  return (
    <Stack spacing={6}>
      <HStack>
        <Text fontWeight="medium">{t('blocks.inputs.picture.itemSettings.image.label')}</Text>
        <Button size="sm" onClick={onToggle}>
          {item.pictureSrc
            ? t('blocks.inputs.picture.itemSettings.image.change.label')
            : t('blocks.inputs.picture.itemSettings.image.pick.label')}
        </Button>

        {item.pictureSrc && (
          <Button variant="outline" size="sm" onClick={removeImage}>
            <CloseIcon />
          </Button>
        )}
      </HStack>

      {item.pictureSrc && (
        <>
          <FormControl label={t('blocks.inputs.picture.itemSettings.title.label')}>
            <InputTextWithVariables
              withVariableButton={true}
              defaultValue={item.title}
              onChange={updateTitle}
            />
          </FormControl>
          <FormControl label={t('blocks.inputs.settings.description.label')}>
            <TextareaWithVariables defaultValue={item.description} onChange={updateDescription} />
          </FormControl>
        </>
      )}

      <Popover isLazy isOpen={isOpen} onClose={onClose}>
        <PopoverContent p="4" w="500px">
          <ImageUploadContent
            uploadFileProps={{
              workspaceId,
              botId: botId,
              blockId,
              itemId: item.id,
            }}
            defaultValue={item.pictureSrc}
            onChange={(url) => {
              updateImage(url)
              onClose()
            }}
          />
        </PopoverContent>
      </Popover>
      <FormControl label="Choice Value">
        <InputTextWithVariables
          defaultValue={item.value ?? ''}
          placeholder="Enter button value"
          onChange={updateButtonValue}
          withVariableButton
        />
      </FormControl>
      <SwitchWithRelatedSettings
        label={t('blocks.inputs.settings.displayCondition.label')}
        moreInfoTooltip={t('blocks.inputs.button.buttonSettings.displayCondition.infoText.label')}
        defaultValue={item.displayCondition?.isEnabled ?? false}
        onChange={updateIsDisplayConditionEnabled}
      >
        <ConditionForm
          condition={
            item.displayCondition?.condition ?? {
              comparisons: [],
              logicalOperator: LogicalOperator.AND,
            }
          }
          onConditionChange={updateDisplayCondition}
        />
      </SwitchWithRelatedSettings>
    </Stack>
  )
}
