import { InputNumberWithVariables, InputTextWithVariables } from '@/components/inputs'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Stack,
} from '@chakra-ui/react'
import { GoogleAnalyticsBlock } from '@quickbot.io/schemas'
import { FormControl } from '@urbiport/ui'
import React from 'react'

type Props = {
  options?: GoogleAnalyticsBlock['options']
  onOptionsChange: (options: GoogleAnalyticsBlock['options']) => void
}

export const GoogleAnalyticsSettings = ({ options, onOptionsChange }: Props) => {
  const updateTrackingId = (trackingId: string) => onOptionsChange({ ...options, trackingId })
  // @ts-expect-error - Known issue with Google Analytics block
  const updateCategory = (category: string) => onOptionsChange({ ...options, category })
  // @ts-expect-error - Known issue with Google Analytics block
  const updateAction = (action: string) => onOptionsChange({ ...options, action })
  // @ts-expect-error - Known issue with Google Analytics block
  const updateLabel = (label: string) => onOptionsChange({ ...options, label })

  const updateValue = (value: number | `{{${string}}}` | undefined) =>
    // @ts-expect-error - Known issue with Google Analytics block
    onOptionsChange({
      ...options,
      value,
    })

  const updateSendTo = (sendTo?: string) =>
    // @ts-expect-error - Known issue with Google Analytics block
    onOptionsChange({
      ...options,
      sendTo,
    })

  return (
    <Stack spacing={6}>
      <FormControl
        label="Measurement ID:"
        moreInfoTooltip="Can be found by clicking on your data stream in Google Analytics dashboard"
      >
        <InputTextWithVariables
          withVariableButton={true}
          defaultValue={options?.trackingId}
          placeholder="G-123456..."
          onChange={updateTrackingId}
        />
      </FormControl>
      <FormControl label="Event action:">
        <InputTextWithVariables
          withVariableButton={true}
          defaultValue={options?.action}
          placeholder="Example: conversion"
          onChange={updateAction}
        />
      </FormControl>
      <Accordion allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton>
              Advanced
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel>
            <FormControl label="Event category:">
              <InputTextWithVariables
                withVariableButton={true}
                defaultValue={options?.category}
                placeholder="Example: Bot"
                onChange={updateCategory}
              />
            </FormControl>
            <FormControl label="Event label:">
              <InputTextWithVariables
                withVariableButton={true}
                defaultValue={options?.label}
                placeholder="Example: Campaign Z"
                onChange={updateLabel}
              />
            </FormControl>
            <FormControl label="Event value:" direction="column">
              <InputNumberWithVariables
                withVariableButton={true}
                defaultValue={options?.value}
                placeholder="Example: 0"
                onChange={updateValue}
              />
            </FormControl>
            <FormControl
              label="Send to:"
              moreInfoTooltip="Useful to send a conversion event to Google Ads"
            >
              <InputTextWithVariables
                withVariableButton={true}
                defaultValue={options?.sendTo?.toString()}
                placeholder="Example: AW-123456789"
                onChange={updateSendTo}
              />
            </FormControl>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Stack>
  )
}
