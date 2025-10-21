import { generateOpenApiDocument } from '@lilyrose2798/trpc-openapi'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { appRouter } from './appRouter'

const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Viewer API',
  version: '3.0.0',
  baseUrl: 'https://quick.bot/api',
  docsUrl: 'https://docs.quick.bot/api',
})

const outputDir = '../../apps/docs/openapi'
const outputFile = `${outputDir}/viewer.json`

if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true })
}

writeFileSync(outputFile, JSON.stringify(openApiDocument, null, 2))

console.log(`✅ Viewer OpenAPI documentation successfully generated at ${outputFile}`)

process.exit()
