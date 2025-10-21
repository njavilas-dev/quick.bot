import { BotProps } from '@urbiport/nextjs'
import parserBabel from 'prettier/parser-babel'
import prettier from 'prettier/standalone'
import { isDefined } from '@quickbot.io/lib'
import { Bot } from '@quickbot.io/schemas'
import { isCloudProdInstance } from '@/helpers/isCloudProdInstance'
import packageJson from '../../../../../../../../packages/embeds/js/package.json'
import { env } from '@quickbot.io/env'

export const parseStringParam = (fieldName: string, fieldValue?: string, defaultValue?: string) => {
  if (!fieldValue) return ''
  if (isDefined(defaultValue) && fieldValue === defaultValue) return ''
  return `${fieldName}: "${fieldValue}",`
}

export const parseNumberOrBoolParam = (fieldName: string, fieldValue?: number | boolean) =>
  isDefined(fieldValue) ? `${fieldName}: ${fieldValue},` : ``

export const parseBotProps = ({ bot, apiHost }: BotProps) => {
  const botLine = parseStringParam('bot', bot as string)
  const apiHostLine = parseStringParam('apiHost', apiHost)
  return `${botLine}${apiHostLine}`
}

export const parseReactStringParam = (fieldName: string, fieldValue?: string) =>
  fieldValue ? `${fieldName}="${fieldValue}"` : ``

export const parseReactNumberOrBoolParam = (fieldName: string, fieldValue?: number | boolean) =>
  isDefined(fieldValue) ? `${fieldName}={${fieldValue}}` : ``

export const parseReactBotProps = ({ bot, apiHost }: BotProps) => {
  const botLine = parseReactStringParam('bot', bot as string)
  const apiHostLine = parseReactStringParam('apiHost', apiHost)
  return `${botLine} ${apiHostLine}`
}

export const botImportCode = isCloudProdInstance()
  ? `import QuickBot from 'https://cdn.jsdelivr.net/npm/@urbiport/js@0.3/dist/web.js'`
  : `import QuickBot from 'https://cdn.jsdelivr.net/npm/@urbiport/js@${packageJson.version}/dist/web.js'`

export const parseInlineScript = (script: string) =>
  prettier.format(
    `const botInitScript = document.createElement("script");
  botInitScript.type = "module";
  botInitScript.innerHTML = \`${script}\`;
  document.body.append(botInitScript);`,
    { parser: 'babel', plugins: [parserBabel] },
  )

export const parseApiHost = (customDomain?: Bot['customDomain']) => {
  if (customDomain) return new URL(`https://${customDomain}`).origin
  return env.NEXT_PUBLIC_VIEWER_URL.at(1) ?? env.NEXT_PUBLIC_VIEWER_URL[0]
}
