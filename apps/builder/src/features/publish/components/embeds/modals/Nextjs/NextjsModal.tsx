import React from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'
import { NextjsStandardInstructions } from './instructions/NextjsStandardInstructions'
import { NextjsPopupInstructions } from './instructions/NextjsPopupInstructions'
import { NextjsBubbleInstructions } from './instructions/NextjsBubbleInstructions'
import { ModalProps } from '../../EmbedButton'

export const NextjsModalContent = (props: ModalProps) => {
  return (
    <Accordion allowToggle variant="flat" defaultIndex={[0]}>
      <AccordionItem>
        <AccordionButton>
          Standard
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <NextjsStandardInstructions {...props} />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionButton>
          Popup
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <NextjsPopupInstructions {...props} />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionButton>
          Bubble
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <NextjsBubbleInstructions {...props} />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}