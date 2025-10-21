import { InputTextWithVariables } from '@/components/inputs'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Stack,
  VStack,
} from '@chakra-ui/react'
import { ChoiceInputBlock, Variable } from '@quickbot.io/schemas'
import React from 'react'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import { defaultChoiceInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/choice/constants'
import { useTranslate } from '@tolgee/react'
import { BoxCard, FormControl, Switch } from '@urbiport/ui'
import { VariablesDropdown } from '@/features/variables/components/VariablesDropdown'

type Props = {
  options?: ChoiceInputBlock['options']
  onOptionsChange: (options: ChoiceInputBlock['options']) => void
}

export const ButtonsBubbleForm = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate()
  const updateIsMultiple = (isMultipleChoice: boolean) =>
    onOptionsChange({ ...options, isMultipleChoice })
  const updateIsSearchable = (isSearchable: boolean) =>
    onOptionsChange({ ...options, isSearchable })
  const updateButtonLabel = (buttonLabel: string) => onOptionsChange({ ...options, buttonLabel })
  const updateSearchInputPlaceholder = (searchInputPlaceholder: string) =>
    onOptionsChange({ ...options, searchInputPlaceholder })
  const updateSaveVariable = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })
  const updateDynamicDataVariable = (variable?: Variable) =>
    onOptionsChange({ ...options, dynamicVariableId: variable?.id })
  const updateOtherOption = (otherOption: boolean) => onOptionsChange({ ...options, otherOption })
  const updateWhatsappFlowHeader = (whatsappFlowHeader: string) =>
    onOptionsChange({ ...options, whatsappFlowHeader })
  const updateWhatsappFlowBody = (whatsappFlowBody: string) =>
    onOptionsChange({ ...options, whatsappFlowBody })
  const updateWhatsappFlowButtonText = (whatsappFlowButtonText: string) =>
    onOptionsChange({ ...options, whatsappFlowButtonText })
  const updateWhatsappFlowQuestionLabel = (whatsappFlowQuestionLabel: string) =>
    onOptionsChange({ ...options, whatsappFlowQuestionLabel })

  return (
    <Stack spacing={6}>
      <SwitchWithRelatedSettings
        label={t('blocks.inputs.settings.multipleChoice.label')}
        defaultValue={options?.isMultipleChoice ?? defaultChoiceInputOptions.isMultipleChoice}
        onChange={updateIsMultiple}
      >
        <FormControl label={t('blocks.inputs.settings.submitButton.label')}>
          <InputTextWithVariables
            withVariableButton={true}
            defaultValue={options?.buttonLabel ?? t('blocks.inputs.settings.buttonText.label')}
            onChange={updateButtonLabel}
          />
        </FormControl>

        <Accordion allowToggle w={'100%'}>
          <AccordionItem>
            <AccordionButton>
              WhatsApp Flow
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={0}>
              <VStack gap={4} padding={0} margin={0}>
                <FormControl
                  label="Flow Header"
                  moreInfoTooltip="Header text shown in WhatsApp flow. Replaces the last message text."
                >
                  <InputTextWithVariables
                    withVariableButton={true}
                    defaultValue={options?.whatsappFlowHeader ?? ''}
                    onChange={updateWhatsappFlowHeader}
                    placeholder="Enter Header text"
                  />
                </FormControl>

                <FormControl
                  label="Flow Body"
                  moreInfoTooltip="Body text shown in WhatsApp flow instead of predefined text."
                >
                  <InputTextWithVariables
                    withVariableButton={true}
                    defaultValue={options?.whatsappFlowBody ?? ''}
                    onChange={updateWhatsappFlowBody}
                    placeholder="Enter body text"
                  />
                </FormControl>

                <FormControl
                  label="Flow Button Text"
                  moreInfoTooltip="Button text (flow_cta) shown in WhatsApp flow."
                >
                  <InputTextWithVariables
                    withVariableButton={true}
                    defaultValue={options?.whatsappFlowButtonText ?? ''}
                    onChange={updateWhatsappFlowButtonText}
                    placeholder="Enter button text"
                  />
                </FormControl>

                <FormControl
                  label="Flow Question Label"
                  moreInfoTooltip="Question label shown in WhatsApp flow."
                >
                  <InputTextWithVariables
                    withVariableButton={true}
                    defaultValue={options?.whatsappFlowQuestionLabel ?? ''}
                    onChange={updateWhatsappFlowQuestionLabel}
                    placeholder="Enter question label"
                  />
                </FormControl>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </SwitchWithRelatedSettings>
      <SwitchWithRelatedSettings
        label={t('blocks.inputs.settings.isSearchable.label')}
        defaultValue={options?.isSearchable ?? defaultChoiceInputOptions.isSearchable}
        onChange={updateIsSearchable}
      >
        <FormControl label={t('blocks.inputs.settings.input.placeholder.label')}>
          <InputTextWithVariables
            withVariableButton={true}
            defaultValue={
              options?.searchInputPlaceholder ??
              t('blocks.inputs.settings.input.filterOptions.label')
            }
            onChange={updateSearchInputPlaceholder}
          />
        </FormControl>
      </SwitchWithRelatedSettings>
      <BoxCard as={VStack} gap={4} padding={3} margin={0} withBorders={true}>
        <FormControl
          label={t('blocks.inputs.settings.otherOption.label')}
          moreInfoTooltip={'Allows an alternative flow to run when no option is selected.'}
          direction={'row'}
        >
          <Switch
            defaultValue={options?.otherOption ?? defaultChoiceInputOptions.isSearchable}
            onChange={updateOtherOption}
          />
        </FormControl>
      </BoxCard>
      <FormControl
        label={t('blocks.inputs.button.settings.dynamicData.label')}
        moreInfoTooltip={t('blocks.inputs.button.settings.dynamicData.infoText.label')}
      >
        <VariablesDropdown
          initialVariableId={options?.dynamicVariableId}
          onSelect={updateDynamicDataVariable}
        />
      </FormControl>
      <FormControl label={t('blocks.inputs.settings.saveAnswer.label')}>
        <VariablesDropdown initialVariableId={options?.variableId} onSelect={updateSaveVariable} />
      </FormControl>
    </Stack>
  )
}
