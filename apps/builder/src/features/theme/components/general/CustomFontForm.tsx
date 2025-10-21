import { InputTextWithVariables } from '@/components/inputs'
import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { CustomFont } from '@quickbot.io/schemas'
import { FormControl } from '@urbiport/ui'

type Props = {
  font: CustomFont
  onFontChange: (font: CustomFont) => void
}

export const CustomFontForm = ({ font, onFontChange }: Props) => {
  const updateFamily = (family: string) => onFontChange({ ...font, family })
  const updateCss = (css: string) => onFontChange({ ...font, css })
  return (
    <>
      <FormControl label="Family" direction="row">
        <InputTextWithVariables
          placeholder='MyAwesomeWebFont, "Helvetica Neue", sans-serif'
          defaultValue={font.family}
          onChange={updateFamily}
        />
      </FormControl>
      <FormControl label="Insert Font Style">
        <CodeEditorWithVariables
          onChange={updateCss}
          defaultValue={font.css}
          lang="css"
          placeholder={`@font-face {
  font-family: 'MyAwesomeWebFont';
  src: url('https://example.com/webfont.woff') format('woff'),
    url('https://example.com/webfont.ttf') format('truetype');
}`}
          maxHeight="200px"
        />
      </FormControl>
    </>
  )
}
