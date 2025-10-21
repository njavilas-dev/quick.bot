import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { BlockTemplate } from 'builder/src/features/blocks/template/types'

export const createTicketTemplate: { template: BlockTemplate } = {
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
                  text: 'Hi there! 😊 To create your ticket, please provide the following information:  \n',
                },
                {
                  bold: true,
                  text: ' Email, Type, Subject, and a brief Description.',
                },
              ],
            },
          ],
        },
      },
      {
        type: InputBlockType.EMAIL,
        options: {
          variableId: '{{fdEmailId}}',
          labels: {
            placeholder: 'Type the email....',
          },
        },
      },
      {
        type: InputBlockType.TEXT,
        options: {
          variableId: '{{fdSubjectId}}',
          labels: {
            placeholder: 'Type the subject for the ticket....',
          },
        },
      },
      {
        type: InputBlockType.TEXT,
        options: {
          variableId: '{{fdDescriptionId}}',
          labels: {
            placeholder: 'Type a description....',
          },
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
                  text: 'Select the type of ticket you want to create:',
                },
              ],
            },
          ],
        },
      },
      {
        type: 'freshdesk' as any,
        options: {
          action: 'Get Ticket Types',
          arrayOutputVariableId: '{{fdTicketTypesId}}',
        },
      },
      {
        type: InputBlockType.CHOICE,
        options: {
          variableId: '{{fdTypeId}}',
          dynamicVariableId: '{{fdTicketTypesId}}',
        },
        items: [],
      },
      {
        type: 'freshdesk' as any,
        options: {
          action: 'Create Ticket',
          subject: '{{fdSubject}}',
          description: '{{fdDescription}}',
          email: '{{fdEmail}}',
          type: '{{fdType}}',
          source: 'Chat',
          outputVariableId: '{{fdTicketResultId}}',
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
                  text: ' {{fdTicketResult}} ',
                },
              ],
            },
          ],
        },
      },
    ],
    variables: [
      {
        name: 'fdSubject',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'fdDescription',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'fdEmail',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'fdTicketTypes',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'fdType',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
      {
        name: 'fdTicketResult',
        value: '',
        isSavedVariable: true,
        isSecretVariable: false,
      },
    ],
  },
}
