import React from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'
import { FramerStandardInstructions } from './instructions/FramerStandardInstructions'
import { FramerPopupInstructions } from './instructions/FramerPopupInstructions'
import { FramerBubbleInstructions } from './instructions/FramerBubbleInstructions'
import { ModalProps } from '../../EmbedButton'

export const FramerModalContent = (props: ModalProps) => {
  return (
    <Accordion allowToggle variant="flat" defaultIndex={[0]}>
      <AccordionItem>
        <AccordionButton>
          Standard
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <FramerStandardInstructions {...props} />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionButton>
          Popup
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <FramerPopupInstructions {...props} />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionButton>
          Bubble
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <FramerBubbleInstructions {...props} />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}