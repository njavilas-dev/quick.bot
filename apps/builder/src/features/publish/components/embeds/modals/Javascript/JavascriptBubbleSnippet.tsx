import prettier from 'prettier/standalone'
import parserHtml from 'prettier/parser-html'
import { BubbleProps } from '@urbiport/nextjs'
import { FormControl } from '@urbiport/ui'
import { useBot } from '@/features/editor/providers/BotProvider'
import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { parseInitBubbleCode, botImportCode } from '../../snippetParsers'

type Props = Pick<BubbleProps, 'theme' | 'previewMessage'> & {
  publicId: string
  apiHost: string
}

export const JavascriptBubbleSnippet = ({ theme, previewMessage, publicId, apiHost }: Props) => {
  const { bot } = useBot()

  const snippet = prettier.format(
    `<script type="module">${botImportCode}
    
${parseInitBubbleCode({
      bot: publicId,
      apiHost,
      theme: {
        ...theme,
        chatWindow: {
          backgroundColor: bot?.theme.general?.background?.content ?? '#fff',
        },
      },
      previewMessage,
    })}</script>`,
    {
      parser: 'html',
      plugins: [parserHtml],
    },
  )

  return (
    <FormControl>
      <CodeEditorWithVariables defaultValue={snippet} lang="html" isReadOnly />
    </FormControl>
  )
}
