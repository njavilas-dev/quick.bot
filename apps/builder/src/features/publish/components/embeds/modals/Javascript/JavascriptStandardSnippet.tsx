import parserHtml from 'prettier/parser-html'
import prettier from 'prettier/standalone'
import { FormControl } from '@urbiport/ui'
import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { parseInitStandardCode, botImportCode } from '../../snippetParsers'

type Props = {
  width?: string
  height?: string
  apiHost: string
  publicId: string
}

export const JavascriptStandardSnippet = ({ width, height, publicId, apiHost }: Props) => {

  const snippet = prettier.format(
    `${parseStandardHeadCode(publicId, apiHost)}\n
      ${parseStandardElementCode(width, height)}`,
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

export const parseStandardHeadCode = (publicId: string, apiHost: string) =>
  prettier.format(
    `<script type="module">${botImportCode};

${parseInitStandardCode({
      bot: publicId,
      apiHost,
    })}</script>`,
    { parser: 'html', plugins: [parserHtml] },
  )

export const parseStandardElementCode = (width?: string, height?: string) => {
  if (!width && !height) return '<quickbot-standard></quickbot-standard>'
  return prettier.format(
    `<quickbot-standard style="${width ? `width: ${width}; ` : ''}${height ? `height: ${height};` : ''
    }"></quickbot-standard>`,
    { parser: 'html', plugins: [parserHtml] },
  )
}
