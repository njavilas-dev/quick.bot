import React from 'react'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  HStack,
  IconButton,
  Stack,
  Text,
} from '@chakra-ui/react'
import { CloseIcon } from '@urbiport/icons'
import { CodeEditor } from '../code-editor'
import { LanguageName } from '@uiw/codemirror-extensions-langs'
import { BoxCard, ToastIcon } from '../../atoms'
import { FormControl } from '../form-control'

export type ToastProps = {
  title?: string
  description?: string
  detailsTitle?: string
  status?: 'info' | 'error' | 'success'
  icon?: React.ReactNode
  details?: {
    content: string
    lang: LanguageName
  }
  primaryButton?: React.ReactNode
  secondaryButton?: React.ReactNode
  onClose: () => void
}

export const Toast = ({
  status = 'error',
  title,
  detailsTitle,
  description,
  details,
  icon,
  primaryButton,
  secondaryButton,
  onClose,
}: ToastProps) => {
  return (
    <BoxCard p={3} width={details ? '450px' : '300px'}>
      <HStack alignItems="flex-start" w="full">
        <HStack alignItems="flex-start" pr="7" spacing="3" w="full">
          <ToastIcon customIcon={icon} status={status} />
          <Stack spacing={3} flex="1" justify="center" h="full">
            <Stack spacing={1}>
              {title && <Text fontWeight="semibold">{title}</Text>}
              {description && <Text>{description}</Text>}
            </Stack>
            {details && (
              <Accordion allowToggle>
                <AccordionItem>
                  <AccordionButton>
                    {detailsTitle}
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel>
                    <FormControl>
                      <CodeEditor
                        isReadOnly
                        defaultValue={details.content}
                        lang={details.lang}
                        minWidth="300px"
                        maxHeight="200px"
                        maxWidth="calc(450px - 100px)"
                      />
                    </FormControl>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            )}
            {(secondaryButton || primaryButton) && (
              <HStack>
                {secondaryButton}
                {primaryButton}
              </HStack>
            )}
          </Stack>
        </HStack>
        <IconButton
          position="absolute"
          aria-label="Close"
          icon={<CloseIcon />}
          onClick={onClose}
          size="sm"
          variant="ghost"
          top={1}
          right={1}
        />
      </HStack>
    </BoxCard>
  )
}
