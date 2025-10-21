import parserHtml from 'prettier/parser-html'
import prettier from 'prettier/standalone'
import { PopupProps } from '@urbiport/nextjs'
import { FormControl } from '@urbiport/ui'
import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { parseInitPopupCode, botImportCode } from '../../snippetParsers'

type Props = Pick<PopupProps, 'autoShowDelay'> & {
  apiHost: string
  publicId: string
}

export const JavascriptPopupSnippet = ({ autoShowDelay, publicId, apiHost }: Props) => {
  const snippet = prettier.format(
    createSnippet({
      bot: publicId,
      apiHost,
      autoShowDelay,
    }),
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

const createSnippet = (params: PopupProps): string => {
  const jsCode = parseInitPopupCode(params)
  return `<script type="module">${botImportCode}

${jsCode}</script>`
}
