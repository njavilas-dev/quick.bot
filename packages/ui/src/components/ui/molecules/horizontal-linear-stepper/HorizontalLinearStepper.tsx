import React from 'react'
import {
  Box,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepNumber,
  StepTitle,
  StepSeparator,
  useColorModeValue,
} from '@chakra-ui/react'
import { ChevronRightIcon } from '@urbiport/icons'

type Props = {
  activeStep: number
  steps: string[]
}

export const HorizontalLinearStepper = (props: Props) => {
  const bgColorSeparator = useColorModeValue('blackAlpha.400', 'whiteAlpha.400')
  return (
    <Stepper index={props.activeStep}>
      {props.steps.map((step, index) => (
        <Step key={index}>
          <StepIndicator
            h={'24px'}
            w={'24px'}
            sx={{
              '[data-status=complete] &': {
                background: 'brand.primary',
              },
              '[data-status=active] &': {
                background: 'brand.primary',
              },
              '[data-status=incomplete] &': {
                background: 'text.lighter',
              },
            }}
            border="none"
            color="white"
          >
            <StepStatus
              complete={<ChevronRightIcon />}
              incomplete={<StepNumber />}
              active={<StepNumber />}
            />
          </StepIndicator>

          <Box flexShrink="0">
            <StepTitle
              sx={{
                '[data-status=complete] &': {
                  color: 'text.normal',
                },
                '[data-status=active] &': {
                  color: 'text.normal',
                },
                '[data-status=incomplete] &': {
                  color: 'text.light',
                },
              }}
            >
              {step}
            </StepTitle>
          </Box>
          <StepSeparator
            _horizontal={{
              backgroundColor: bgColorSeparator,
            }}
          />
        </Step>
      ))}
    </Stepper>
  )
}
