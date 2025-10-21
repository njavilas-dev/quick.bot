import parserBabel from 'prettier/parser-babel'
import prettier from 'prettier/standalone'
import { FormControl } from '@urbiport/ui'
import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { parseReactBotProps } from '../../snippetParsers'

type Props = {
  width?: string;
  height: string
  publicId: string
}

export const NextjsStandardSnippet = ({ width, height, publicId }: Props) => {
  const snippet = prettier.format(
    `import { Standard } from "@urbiport/nextjs";

      const App = () => {
        return <Standard ${parseReactBotProps({
      bot: publicId,
    })} style={{width: "${width}", height: "${height}"}} />
      }`,
    {
      parser: 'babel',
      plugins: [parserBabel],
    },
  )

  return (
    <FormControl>
      <CodeEditorWithVariables defaultValue={snippet} lang="html" isReadOnly />
    </FormControl>
  )
}
