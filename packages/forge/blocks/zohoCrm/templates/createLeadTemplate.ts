import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { BlockTemplate } from 'builder/src/features/blocks/template/types'

export const createLeadTemplate: { template: BlockTemplate } = {
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
                  text: "Hello! 👋 We'd love to learn more about your interest in our services.\n Please provide the following details:",
                },
                {
                  bold: true,
                  text: 'Full name, Email address, How you found us',
                },
                {
                  text: ' (e.g. social media, referral, etc.)',
                },
              ],
            },
          ],
        },
      },
      {
        type: InputBlockType.TEXT,
        options: {
          variableId: '{{zohoLeadFirstNameId}}',
          labels: {
            placeholder: 'Type your first name...',
          },
        },
      },
      {
        type: InputBlockType.TEXT,
        options: {
          variableId: '{{zohoLeadLastNameId}}',
          labels: {
            placeholder: 'Type your last name...',
          },
        },
      },
      {
        type: InputBlockType.EMAIL,
        options: {
          variableId: '{{zohoLeadEmailId}}',
          labels: {
            placeholder: 'Type your email...',
          },
        },
      },
      {
        type: InputBlockType.PHONE,
        options: {
          variableId: '{{zohoLeadPhoneId}}',
          labels: {
            placeholder: 'Type your phone...',
          },
        },
      },
      {
        type: InputBlockType.TEXT,
        options: {
          variableId: '{{zohoLeadSourceId}}',
          labels: {
            placeholder: 'How you found us (e.g. social media, referral, etc.)',
          },
        },
      },
      {
        type: 'zoho-crm' as any,
        options: {
          action: 'Create Lead',
          firstName: '{{zohoLeadFirstName}}',
          lastName: '{{zohoLeadLastName}}',
          email: '{{zohoLeadEmail}}',
          phone: '{{zohoLeadPhone}}',
          leadSource: '{{zohoLeadSource}}',
          storeLeadIdIn: '{{zohoLeadResultIdId}}',
          storeMessageIn: '{{zohoLeadResultId}}',
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
                  text: ' {{zohoLeadResult}} ',
                },
              ],
            },
          ],
        },
      },
    ],
    variables: [
      {
        name: 'zohoLeadFirstName',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'zohoLeadLastName',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'zohoLeadEmail',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'zohoLeadPhone',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'zohoLeadSource',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'zohoLeadResult',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'zohoLeadResultId',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
    ],
  },
}
