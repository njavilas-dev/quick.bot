import React, { forwardRef } from 'react'
import {
  FormControl as FormControlChakra,
  FormControlProps as FormControlPropsChakra,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Stack,
} from '@chakra-ui/react'
import { MoreInfoTooltip } from '../../molecules'

export type FormControlProps = Omit<FormControlPropsChakra, 'label'> & {
  label?: string | React.ReactNode
  helperText?: string | React.ReactNode
  errorText?: string | React.ReactNode
  moreInfoTooltip?: string | React.ReactNode
  direction?: 'row' | 'column'
  helperTextPosition?: 'top' | 'bottom' | 'left' | 'right'
  children: React.ReactNode
}

export const FormControl = forwardRef<HTMLDivElement, FormControlProps>(
  (
    {
      isRequired,
      label,
      helperText,
      errorText,
      moreInfoTooltip,
      direction = 'column',
      helperTextPosition,
      children,
      isDisabled,
      ...props
    },
    ref,
  ) => {
    const defaultHelperPosition = direction === 'row' ? 'right' : 'bottom'
    const finalHelperPosition = helperTextPosition || defaultHelperPosition

    const renderHelperText = () => {
      if (!helperText) return null
      return <FormHelperText mt="0">{helperText}</FormHelperText>
    }

    const renderContent = () => {
      if (finalHelperPosition === 'top') {
        return (
          <>
            {renderHelperText()}
            {children}
          </>
        )
      }
      if (finalHelperPosition === 'bottom') {
        return (
          <>
            {children}
            {renderHelperText()}
          </>
        )
      }
      if (finalHelperPosition === 'left') {
        return (
          <HStack spacing={3}>
            {renderHelperText()}
            {children}
          </HStack>
        )
      }
      if (finalHelperPosition === 'right') {
        return (
          <HStack spacing={3}>
            {children}
            {renderHelperText()}
          </HStack>
        )
      }
      return children
    }

    return (
      <FormControlChakra
        ref={ref}
        isRequired={isRequired}
        as={direction === 'column' ? Stack : HStack}
        spacing={direction === 'column' ? 2 : 3}
        justifyContent={direction === 'column' ? 'flex-start' : 'space-between'}
        opacity={isDisabled ? 0.4 : 1}
        pointerEvents={isDisabled ? 'none' : 'auto'}
        userSelect={isDisabled ? 'none' : 'auto'}
        {...props}
      >
        {label && (
          <FormLabel
            display="flex"
            gap="1"
            m={0}
            sx={{
              span: {
                position: 'relative',
                bottom: '-1px',
              },
            }}
          >
            {label}
            {moreInfoTooltip && <MoreInfoTooltip>{moreInfoTooltip}</MoreInfoTooltip>}
          </FormLabel>
        )}
        {renderContent()}
        {errorText && <FormErrorMessage>{errorText}</FormErrorMessage>}
      </FormControlChakra>
    )
  },
)

FormControl.displayName = 'FormControl'
