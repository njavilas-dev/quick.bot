import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { BlockTemplate } from 'builder/src/features/blocks/template/types'

export const getLeadByEmailTemplate: { template: BlockTemplate } = {
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
                  text: 'To look up your information, I’ll need a reference detail. Please provide your \n',
                },
                {
                  bold: true,
                  text: ' email address or customer ID 📧🔎',
                },
                {
                  text: ' I’ll use it to find your lead record in our Zoho CRM.',
                },
              ],
            },
          ],
        },
      },
      {
        type: InputBlockType.EMAIL,
        options: {
          variableId: '{{zohoGetLeadByEmailId}}',
          labels: {
            placeholder: 'Type your email...',
          },
        },
      },
      {
        type: 'zoho-crm' as any,
        options: {
          action: 'Get Lead by Email',
          email: '{{zohoGetLeadByEmail}}',
          storeFullNameIn: '{{zohoGetLeadByEmailResultNameId}}',
          storeLeadIdIn: '{{zohoGetLeadByEmailResultIdId}}',
          storeLeadStatusIn: '{{zohoGetLeadByEmailResultStatusId}}',
          storePhoneIn: '{{zohoGetLeadByEmailResultPhoneId}}',
          storeMessageIn: '{{zohoGetLeadByEmailResultId}}',
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
                  text: `{{zohoGetLeadByEmailResult}}`,
                },
              ],
            },
          ],
        },
      },
    ],
    variables: [
      {
        name: 'zohoGetLeadByEmail',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'zohoGetLeadByEmailResultName',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'zohoGetLeadByEmailResultPhone',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'zohoGetLeadByEmailResultStatus',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'zohoGetLeadByEmailResult',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'zohoGetLeadByEmailResultId',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
    ],
  },
}
