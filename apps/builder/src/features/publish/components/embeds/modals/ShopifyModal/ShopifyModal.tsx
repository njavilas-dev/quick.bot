import React from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'
import { ModalProps } from '../../EmbedButton'
import { ShopifyStandardInstructions } from './instructions/ShopifyStandardInstructions'
import { ShopifyPopupInstructions } from './instructions/ShopifyPopupInstructions'
import { ShopifyBubbleInstructions } from './instructions/ShopifyBubbleInstructions'

export const ShopifyModalContent = (props: ModalProps) => {
  return (
    <Accordion allowToggle variant="flat" defaultIndex={[0]}>
      <AccordionItem>
        <AccordionButton>
          Standard
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <ShopifyStandardInstructions {...props} />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionButton>
          Popup
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <ShopifyPopupInstructions {...props} />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionButton>
          Bubble
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <ShopifyBubbleInstructions {...props} />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
