import { parseBlockCredentials, parseBlockSchema } from '@quickbot.io/forge'
import { wooCommerceBlock } from '.'
import { auth } from './auth'

export const wooCommerceBlockSchema = parseBlockSchema(wooCommerceBlock)
export const wooCommerceCredentialsSchema = parseBlockCredentials(wooCommerceBlock.id, auth.schema)
