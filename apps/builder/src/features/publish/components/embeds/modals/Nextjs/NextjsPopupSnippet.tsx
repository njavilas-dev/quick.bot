import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { PopupProps } from '@urbiport/nextjs'
import parserBabel from 'prettier/parser-babel'
import prettier from 'prettier/standalone'
import { parseReactPopupProps } from '../../snippetParsers'
import { FormControl } from '@urbiport/ui'

type Props = Pick<PopupProps, 'autoShowDelay'> & {
  publicId: string
}

export const NextjsPopupSnippet = ({ autoShowDelay, publicId }: Props) => {

  const snippet = prettier.format(
    `import { Popup } from "@urbiport/nextjs";

      const App = () => {
        return <Popup ${parseReactPopupProps({
      bot: publicId,
      autoShowDelay,
    })}/>;
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
