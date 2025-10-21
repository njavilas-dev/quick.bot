import React from 'react'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Stack,
} from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { FileInputBlock, Variable } from '@quickbot.io/schemas'
import { Select, Switch } from '@urbiport/ui'
import {
  defaultFileInputOptions,
  fileVisibilityOptions,
} from '@quickbot.io/schemas/features/blocks/inputs/file/constants'
import { InputTextWithVariables } from '@/components/inputs'
import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { FormControl } from '@urbiport/ui'
import { VariablesDropdown } from '@/features/variables/components/VariablesDropdown'
import { env } from '@quickbot.io/env'

type Props = {
  options: FileInputBlock['options']
  onOptionsChange: (options: FileInputBlock['options']) => void
}

export const FileInputBubbleForm = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate()

  const handleButtonLabelChange = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } })

  const handlePlaceholderLabelChange = (placeholder: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, placeholder } })

  const handleMultipleFilesChange = (isMultipleAllowed: boolean) =>
    onOptionsChange({ ...options, isMultipleAllowed })

  const handleVariableChange = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })

  const handleRequiredChange = (isRequired: boolean) => onOptionsChange({ ...options, isRequired })

  const updateClearButtonLabel = (clear: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, clear } })

  const updateSkipButtonLabel = (skip: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, skip } })

  const updateVisibility = (visibility: (typeof fileVisibilityOptions)[number]) => {
    onOptionsChange({ ...options, visibility })
  }

  const updateSingleFileSuccessLabel = (single: string) =>
    onOptionsChange({
      ...options,
      labels: {
        ...options?.labels,
        success: { ...options?.labels?.success, single },
      },
    })

  const updateMultipleFilesSuccessLabel = (multiple: string) =>
    onOptionsChange({
      ...options,
      labels: {
        ...options?.labels,
        success: { ...options?.labels?.success, multiple },
      },
    })

  return (
    <Stack spacing={6}>
      <FormControl direction="row" label={t('blocks.inputs.file.settings.required.label')}>
        <Switch
          defaultValue={options?.isRequired ?? defaultFileInputOptions.isRequired}
          onChange={handleRequiredChange}
        />
      </FormControl>
      <FormControl direction="row" label={t('blocks.inputs.file.settings.allowMultiple.label')}>
        <Switch
          defaultValue={options?.isMultipleAllowed ?? defaultFileInputOptions.isMultipleAllowed}
          onChange={handleMultipleFilesChange}
        />
      </FormControl>
      <FormControl label={t('blocks.inputs.settings.placeholder.label')}>
        <CodeEditorWithVariables
          withVariableButton={true}
          lang="html"
          onChange={handlePlaceholderLabelChange}
          defaultValue={options?.labels?.placeholder ?? defaultFileInputOptions.labels.placeholder}
          height={'100px'}
        />
      </FormControl>
      <Accordion allowToggle>
        <AccordionItem>
          <AccordionButton>
            Labels
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            {env.NEXT_PUBLIC_BETA_ENV && (
              <FormControl label={t('blocks.inputs.settings.button.label')}>
                <InputTextWithVariables
                  defaultValue={options?.labels?.button ?? defaultFileInputOptions.labels.button}
                  onChange={handleButtonLabelChange}
                />
              </FormControl>
            )}
            {options?.isMultipleAllowed && (
              <FormControl label={t('blocks.inputs.file.settings.clear.label')}>
                <InputTextWithVariables
                  defaultValue={options?.labels?.clear ?? defaultFileInputOptions.labels.clear}
                  onChange={updateClearButtonLabel}
                />
              </FormControl>
            )}
            {!(options?.isRequired ?? defaultFileInputOptions.isRequired) && (
              <FormControl label={t('blocks.inputs.file.settings.skip.label')}>
                <InputTextWithVariables
                  defaultValue={options?.labels?.skip ?? defaultFileInputOptions.labels.skip}
                  onChange={updateSkipButtonLabel}
                />
              </FormControl>
            )}
            <FormControl label="Single file success">
              <InputTextWithVariables
                defaultValue={
                  options?.labels?.success?.single ?? defaultFileInputOptions.labels.success.single
                }
                onChange={updateSingleFileSuccessLabel}
              />
            </FormControl>
            {options?.isMultipleAllowed && (
              <FormControl
                label="Multi files success"
                moreInfoTooltip="Include {total} to show the total number of files uploaded"
              >
                <InputTextWithVariables
                  defaultValue={
                    options?.labels?.success?.multiple ??
                    defaultFileInputOptions.labels.success.multiple
                  }
                  onChange={updateMultipleFilesSuccessLabel}
                />
              </FormControl>
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <FormControl
        label="Visibility:"
        moreInfoTooltip='This setting determines who can see the uploaded files. "Public" means that anyone who has the link can see the files. "Private" means that only a members of this workspace can see the files.'
      >
        <Select
          withClear={false}
          selectedItem={options?.visibility ?? defaultFileInputOptions.visibility}
          onSelect={updateVisibility}
          items={fileVisibilityOptions}
        />
      </FormControl>
      <FormControl
        label={
          options?.isMultipleAllowed
            ? t('blocks.inputs.file.settings.saveMultipleUpload.label')
            : t('blocks.inputs.file.settings.saveSingleUpload.label')
        }
      >
        <VariablesDropdown
          initialVariableId={options?.variableId}
          onSelect={handleVariableChange}
        />
      </FormControl>
    </Stack>
  )
}
