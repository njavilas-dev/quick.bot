import { BotProps } from '@urbiport/nextjs'
import parserBabel from 'prettier/parser-babel'
import prettier from 'prettier/standalone'
import { parseBotProps } from './shared'

export const parseInitStandardCode = ({ bot, apiHost }: Pick<BotProps, 'bot' | 'apiHost'>) => {
  const botProps = parseBotProps({ bot, apiHost })

  return prettier.format(`QuickBot.initStandard({${botProps}});`, {
    parser: 'babel',
    plugins: [parserBabel],
  })
}
