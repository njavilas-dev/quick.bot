import { parseBlockCredentials, parseBlockSchema } from '@quickbot.io/forge'
import { zohoCrmBlock } from '.'
import { auth } from './auth'

export const zohoCrmBlockSchema = parseBlockSchema(zohoCrmBlock)
export const zohoCrmCredentialsSchema = parseBlockCredentials(
  zohoCrmBlock.id,
  auth.schema
)
