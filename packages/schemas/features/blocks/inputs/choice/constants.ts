import { defaultButtonLabel } from '../constants'
import { ChoiceInputBlock } from './schema'

export const defaultChoiceInputOptions = {
  buttonLabel: defaultButtonLabel,
  whatsappFlowHeader: 'Choose your options',
  whatsappFlowBody: 'You can select more than one.',
  whatsappFlowButtonText: 'Confirm',
  whatsappFlowQuestionLabel: 'Choose your options:',
  searchInputPlaceholder: 'Filter the options...',
  isMultipleChoice: false,
  isSearchable: false,
  otherOption: false,
} as const satisfies ChoiceInputBlock['options']
