import { generateOpenApiDocument } from '@lilyrose2798/trpc-openapi'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { publicRouter } from './routers/publicRouter'

const openApiDocument = generateOpenApiDocument(publicRouter, {
  title: 'Builder API',
  version: '1.0.0',
  docsUrl: 'https://docs.quick.bot/api',
  baseUrl: 'https://app.quick.bot/api',
})

const outputDir = '../../apps/docs/openapi'
const outputFile = `${outputDir}/builder.json`

if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true })
}

writeFileSync(outputFile, JSON.stringify(openApiDocument, null, 2))

console.log(`✅ Builder OpenAPI documentation successfully generated at ${outputFile}`)

process.exit()
