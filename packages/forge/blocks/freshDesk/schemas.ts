import { parseBlockCredentials, parseBlockSchema } from '@quickbot.io/forge'
import { freshDeskBlock } from '.'
import { auth } from './auth'

export const freshDeskBlockSchema = parseBlockSchema(freshDeskBlock)
export const freshDeskCredentialsSchema = parseBlockCredentials(freshDeskBlock.id, auth.schema)
