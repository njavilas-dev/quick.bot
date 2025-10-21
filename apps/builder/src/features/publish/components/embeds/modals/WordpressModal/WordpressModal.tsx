import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'
import { ModalProps } from '../../EmbedButton'
import { WordpressStandardInstructions } from './instructions/WordpressStandardInstructions'
import { WordpressPopupInstructions } from './instructions/WordpressPopupInstructions'
import { WordpressBubbleInstructions } from './instructions/WordpressBubbleInstructions'

export const WordpressModalContent = (props: ModalProps) => {
  return (
    <Accordion allowToggle variant="flat" defaultIndex={[0]}>
      <AccordionItem>
        <AccordionButton>
          Standard
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <WordpressStandardInstructions {...props} />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionButton>
          Popup
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <WordpressPopupInstructions {...props} />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionButton>
          Bubble
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <WordpressBubbleInstructions {...props} />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
