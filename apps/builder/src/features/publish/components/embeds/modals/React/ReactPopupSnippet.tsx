import parserBabel from 'prettier/parser-babel'
import prettier from 'prettier/standalone'
import { PopupProps } from '@urbiport/nextjs'
import { FormControl } from '@urbiport/ui'
import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { parseReactPopupProps } from '../../snippetParsers'

type Props = Pick<PopupProps, 'autoShowDelay'> & {
  publicId: string
}

export const ReactPopupSnippet = ({ autoShowDelay, publicId }: Props) => {

  const snippet = prettier.format(
    `import { Popup } from "@urbiport/react";

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
