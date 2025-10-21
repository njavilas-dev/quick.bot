import { anthropicBlock } from '@quickbot.io/anthropic-block'
import { anthropicCredentialsSchema } from '@quickbot.io/anthropic-block/schemas'
import { chatNodeBlock } from '@quickbot.io/chat-node-block'
import { chatNodeCredentialsSchema } from '@quickbot.io/chat-node-block/schemas'
import { difyAiBlock } from '@quickbot.io/dify-ai-block'
import { difyAiCredentialsSchema } from '@quickbot.io/dify-ai-block/schemas'
import { elevenlabsBlock } from '@quickbot.io/elevenlabs-block'
import { elevenlabsCredentialsSchema } from '@quickbot.io/elevenlabs-block/schemas'
import { mistralBlock } from '@quickbot.io/mistral-block'
import { mistralCredentialsSchema } from '@quickbot.io/mistral-block/schemas'
import { openRouterBlock } from '@quickbot.io/open-router-block'
import { openRouterCredentialsSchema } from '@quickbot.io/open-router-block/schemas'
import { openAIBlock } from '@quickbot.io/openai-block'
import { openAICredentialsSchema } from '@quickbot.io/openai-block/schemas'
import { togetherAiBlock } from '@quickbot.io/together-ai-block'
import { togetherAiCredentialsSchema } from '@quickbot.io/together-ai-block/schemas'
import { nocodbBlock } from '@quickbot.io/nocodb-block'
import { nocodbCredentialsSchema } from '@quickbot.io/nocodb-block/schemas'
import { segmentBlock } from '@quickbot.io/segment-block'
import { segmentCredentialsSchema } from '@quickbot.io/segment-block/schemas'
import { groqBlock } from '@quickbot.io/groq-block'
import { groqCredentialsSchema } from '@quickbot.io/groq-block/schemas'
import { twilioComBlock } from '@quickbot.io/twilio-com-block'
import { twilioComCredentialsSchema } from '@quickbot.io/twilio-com-block/schemas'
import { wordpressBlock } from '@quickbot.io/wordpress-block'
import { wordpressCredentialsSchema } from '@quickbot.io/wordpress-block/schemas'

import { wooCommerceBlock } from '@quickbot.io/woocommerce-block'
import { wooCommerceCredentialsSchema } from '@quickbot.io/woocommerce-block/schemas'
import { freshDeskBlock } from '@quickbot.io/freshdesk-block'
import { freshDeskCredentialsSchema } from '@quickbot.io/freshdesk-block/schemas'
import { zohoCrmBlock } from '@quickbot.io/zoho-crm-block'
import { zohoCrmCredentialsSchema } from '@quickbot.io/zoho-crm-block/schemas'

export const forgedCredentialsSchemas = {
  [openAIBlock.id]: openAICredentialsSchema,
  [chatNodeBlock.id]: chatNodeCredentialsSchema,
  [difyAiBlock.id]: difyAiCredentialsSchema,
  [mistralBlock.id]: mistralCredentialsSchema,
  [elevenlabsBlock.id]: elevenlabsCredentialsSchema,
  [anthropicBlock.id]: anthropicCredentialsSchema,
  [togetherAiBlock.id]: togetherAiCredentialsSchema,
  [openRouterBlock.id]: openRouterCredentialsSchema,
  [nocodbBlock.id]: nocodbCredentialsSchema,
  [segmentBlock.id]: segmentCredentialsSchema,
  [groqBlock.id]: groqCredentialsSchema,
  [twilioComBlock.id]: twilioComCredentialsSchema,
  [wooCommerceBlock.id]: wooCommerceCredentialsSchema,
  [wordpressBlock.id]: wordpressCredentialsSchema,
  [freshDeskBlock.id]: freshDeskCredentialsSchema,
  [zohoCrmBlock.id]: zohoCrmCredentialsSchema,
}
