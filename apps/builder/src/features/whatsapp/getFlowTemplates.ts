import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import fs from 'fs'
import path from 'path'

const flowTemplatesSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    template: z.string(),
  }),
)

export const getFlowTemplates = authenticatedProcedure
  .output(flowTemplatesSchema)
  .query(async () => {
    const flowsDir = path.join(process.cwd(), '../../packages/bot-engine/whatsapp/flows')
    const files = await fs.promises.readdir(flowsDir)

    const templates = await Promise.all(
      files
        .filter((file) => file.endsWith('.json'))
        .map(async (file) => {
          const content = await fs.promises.readFile(path.join(flowsDir, file), 'utf-8')
          const json = JSON.parse(content)
          return {
            id: json.id,
            name: json.name,
            description: json.description,
            template: JSON.stringify(json.template, null, 2),
          }
        }),
    )

    return templates
  })
