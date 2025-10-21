import { z } from 'zod'
import { extendZodWithOpenApi } from 'zod-openapi'
import { extendWithBotLayout, ZodLayoutMetadata } from './extendWithBotLayout'

extendZodWithOpenApi(z)
extendWithBotLayout(z)

export { z }
export type { ZodLayoutMetadata }
