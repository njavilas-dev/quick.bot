import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Stack,
} from '@chakra-ui/react'
import React from 'react'
import { InputTextWithVariables } from '@/components/inputs'
import { Switch } from '@urbiport/ui'
import { WaitBlock } from '@quickbot.io/schemas'
import { defaultWaitOptions } from '@quickbot.io/schemas/features/blocks/logic/wait/constants'
import { useTranslate } from '@tolgee/react'
import { FormControl } from '@urbiport/ui'

type Props = {
  options: WaitBlock['options']
  onOptionsChange: (options: WaitBlock['options']) => void
}

export const WaitSettings = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate()

  const handleSecondsChange = (secondsToWaitFor: string | undefined) => {
    onOptionsChange({ ...options, secondsToWaitFor })
  }

  const updateShouldPause = (shouldPause: boolean) => {
    onOptionsChange({ ...options, shouldPause })
  }

  return (
    <Stack spacing={6}>
      <FormControl label={t('blocks.logic.wait.seconds.label')}>
        <InputTextWithVariables
          withVariableButton={true}
          defaultValue={options?.secondsToWaitFor}
          onChange={handleSecondsChange}
        />
      </FormControl>
      <Accordion allowToggle>
        <AccordionItem>
          <AccordionButton>
            {t('blocks.logic.wait.advanced.label')}
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <FormControl
              direction="row"
              label={t('blocks.logic.wait.pause.label')}
              moreInfoTooltip={t('blocks.logic.wait.pause.tooltip')}
            >
              <Switch
                defaultValue={options?.shouldPause ?? defaultWaitOptions.shouldPause}
                onChange={updateShouldPause}
              />
            </FormControl>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Stack>
  )
}
