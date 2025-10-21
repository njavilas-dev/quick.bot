import { BlockTemplateConfigs } from '@/features/blocks/template/types'
import { woocommerceTemplate } from '@quickbot.io/woocommerce-block/templates'
import {
  wordpressLoginTemplate,
  wordpressSigninTemplate,
} from '@quickbot.io/wordpress-block/templates'
import { getRowTemplate, insertRowTemplate, updateRowTemplate } from '@quickbot.io/schemas'
import {
  createTicketTemplate,
  getTicketTypesTemplate,
} from '@quickbot.io/freshdesk-block/templates'

import {
  createContactTemplate,
  createLeadTemplate,
  getLeadByEmailTemplate,
} from '@quickbot.io/zoho-crm-block/templates'

import {
  intentClassificatorTemplate,
  salesAssistant,
  dynamicFormTemplate,
} from '@quickbot.io/openai-block/templates'

export const blockTemplates: BlockTemplateConfigs = {
  woocommerce: [
    {
      id: 'product-search',
      title: 'Product Search',
      description:
        'Allow customers to search and browse your products with filters and pagination.',
      icon: '🕵',
      isDefault: true,
      template: woocommerceTemplate.template,
    },
  ],
  wordpress: [
    {
      id: 'login',
      title: 'WordPress Login',
      description: 'Allow customers to log in using their WordPress account on your website.',
      icon: '🔒',
      isDefault: true,
      template: wordpressLoginTemplate.template,
    },
    {
      id: 'register',
      title: 'WordPress Register',
      description: 'Allow customers to register an account on your WordPress website.',
      icon: '👤',
      isDefault: true,
      template: wordpressSigninTemplate.template,
    },
  ],
  'Google Sheets': [
    {
      id: 'google-sheets-insert-row',
      title: 'Insert a row',
      description: 'This template is an example about insert a row in Google Sheets.',
      icon: '📑',
      isDefault: true,
      template: insertRowTemplate.template,
    },
    {
      id: 'google-sheets-get-row',
      title: 'Get a row',
      description: 'This template is an example about get a row in Google Sheets.',
      icon: '📑',
      isDefault: true,
      template: getRowTemplate.template,
    },
    {
      id: 'google-sheets-update-row',
      title: 'Update a row',
      description: 'This template is an example about update a row in Google Sheets.',
      icon: '📑',
      isDefault: true,
      template: updateRowTemplate.template,
    },
  ],
  freshdesk: [
    {
      id: 'get-ticket-types',
      title: 'Get ticket types',
      description: 'Retrieve a list of ticket types from Freshdesk.',
      icon: '🎫',
      isDefault: true,
      template: getTicketTypesTemplate.template,
    },
    {
      id: 'create-ticket',
      title: 'Create ticket',
      description: 'Allow customers to create a ticket in Freshdesk.',
      icon: '🎟️',
      isDefault: true,
      template: createTicketTemplate.template,
    },
  ],
  'zoho-crm': [
    {
      id: 'create-contact',
      title: 'Create Contact',
      description: 'Create a new contact in Zoho CRM with the provided details.',
      icon: '📇',
      isDefault: true,
      template: createContactTemplate.template,
    },
    {
      id: 'create-lead',
      title: 'Create Lead',
      description: 'Create a new lead in Zoho CRM using user-provided information.',
      icon: '🧲',
      isDefault: true,
      template: createLeadTemplate.template,
    },
    {
      id: 'get-lead-by-email',
      title: 'Get Lead by Email',
      description: 'Retrieve lead information from Zoho CRM using an email address.',
      icon: '📬',
      isDefault: true,
      template: getLeadByEmailTemplate.template,
    },
  ],
  openai: [
    {
      id: 'classificator',
      title: 'Intent Classifier',
      description: 'Automatically classify user messages into Sales, Support, Closure, Ban, or Unknown categories using AI function calling. Includes conditional routing based on classification results.',
      icon: '🧠',
      isDefault: true,
      template: intentClassificatorTemplate.template,
    },
    {
      id: 'prompt',
      title: 'Sales Assistant',
      description: 'Professional AI sales assistant that engages customers, understands their needs, and guides them toward purchase decisions using empathetic conversation.',
      icon: '💼',
      isDefault: false,
      template: salesAssistant.template,
    },
    {
      id: 'dynamic-form',
      title: 'Dynamic Form',
      description: 'Conversational AI form that collects user information (name, email, address) through natural dialogue. Uses function calling to extract structured data from free-form conversation.',
      icon: '📝',
      isDefault: false,
      template: dynamicFormTemplate.template,
    },
  ],
}
