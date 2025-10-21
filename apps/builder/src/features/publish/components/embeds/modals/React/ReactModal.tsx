import React from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'
import { ReactStandardInstructions } from './instructions/ReactStandardInstructions'
import { ReactPopupInstructions } from './instructions/ReactPopupInstructions'
import { ReactBubbleInstructions } from './instructions/ReactBubbleInstructions'
import { ModalProps } from '../../EmbedButton'

export const ReactModalContent = (props: ModalProps) => {
  return (
    <Accordion allowToggle variant="flat" defaultIndex={[0]}>
      <AccordionItem>
        <AccordionButton>
          Standard
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <ReactStandardInstructions {...props} />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionButton>
          Popup
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <ReactPopupInstructions {...props} />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionButton>
          Bubble
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <ReactBubbleInstructions {...props} />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}