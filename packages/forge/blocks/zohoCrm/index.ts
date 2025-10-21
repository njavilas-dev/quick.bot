import { createBlock } from '@quickbot.io/forge'
import { ZohoCrmLogo } from './logo'
import { auth } from './auth'
import { testConnection } from './actions/testConnection'
import { getOrganizationInfo } from './actions/getOrganizationInfo'
import { createContact } from './actions/createContact'
import { createLead } from './actions/createLead'
import { getLeadByEmail } from './actions/getLeadByEmail'

export const zohoCrmBlock = createBlock({
  id: 'zoho-crm',
  name: 'Zoho CRM',
  tags: ['CRM', 'Zoho', 'customer management', 'sales', 'leads', 'contacts', 'deals', 'marketing'],
  LightLogo: ZohoCrmLogo,
  DarkLogo: ZohoCrmLogo,
  docsUrl: 'https://docs.quick.bot/builder/editor/blocks/integrations/zoho-crm',
  auth,
  actions: [testConnection, getOrganizationInfo, createContact, createLead, getLeadByEmail],
})
