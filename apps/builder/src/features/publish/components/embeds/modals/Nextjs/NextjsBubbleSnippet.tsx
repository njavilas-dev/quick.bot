import parserBabel from 'prettier/parser-babel'
import prettier from 'prettier/standalone'
import { BubbleProps } from '@urbiport/nextjs'
import { FormControl } from '@urbiport/ui'
import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { parseReactBubbleProps } from '../../snippetParsers'

type Props = Pick<BubbleProps, 'theme' | 'previewMessage'> & {
  publicId: string
}

export const NextjsBubbleSnippet = ({
  theme,
  previewMessage,
  publicId,
}: Props) => {

  const snippet = prettier.format(
    `import { Bubble } from "@urbiport/nextjs";

      const App = () => {
        return <Bubble ${parseReactBubbleProps({
      bot: publicId,
      theme,
      previewMessage,
    })}/>
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
