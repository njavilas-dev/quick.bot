import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { BlockTemplate } from 'builder/src/features/blocks/template/types'

export const createContactTemplate: { template: BlockTemplate } = {
  template: {
    blocks: [
      {
        type: BubbleBlockType.TEXT,
        content: {
          richText: [
            {
              type: 'p',
              children: [
                {
                  text: 'Hi there! 😊 To register you as a contact, I’ll need a few details. Please share your \n',
                },
                {
                  bold: true,
                  text: ' full name, email, and phone number.',
                },
                {
                  text: 'We’ll use this information to create your contact in Zoho CRM.',
                },
              ],
            },
          ],
        },
      },
      {
        type: InputBlockType.TEXT,
        options: {
          variableId: '{{zohoContactFirstNameId}}',
          labels: {
            placeholder: 'Type your first name...',
          },
        },
      },
      {
        type: InputBlockType.TEXT,
        options: {
          variableId: '{{zohoContactLastNameId}}',
          labels: {
            placeholder: 'Type your last name...',
          },
        },
      },
      {
        type: InputBlockType.EMAIL,
        options: {
          variableId: '{{zohoContactEmailId}}',
          labels: {
            placeholder: 'Type your email...',
          },
        },
      },
      {
        type: InputBlockType.PHONE,
        options: {
          variableId: '{{zohoContactPhoneId}}',
          labels: {
            placeholder: 'Type your phone...',
          },
        },
      },
      {
        type: 'zoho-crm' as any,
        options: {
          action: 'Create Contact',
          firstName: '{{zohoContactFirstName}}',
          lastName: '{{zohoContactLastName}}',
          email: '{{zohoContactEmail}}',
          phone: '{{zohoContactPhone}}',
          storeContactIdIn: '{{zohoContactResultIdId}}',
          storeMessageIn: '{{zohoContactResultId}}',
        },
      },
      {
        type: BubbleBlockType.TEXT,
        content: {
          richText: [
            {
              type: 'p',
              children: [
                {
                  text: ' {{zohoContactResult}} ',
                },
              ],
            },
          ],
        },
      },
    ],
    variables: [
      {
        name: 'zohoContactFirstName',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'zohoContactLastName',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'zohoContactEmail',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'zohoContactPhone',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'zohoContactSource',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'zohoContactResult',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'zohoContactResultId',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
    ],
  },
}
