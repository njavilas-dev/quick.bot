import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { FormControl } from '@urbiport/ui'

export const InstallReactPackageSnippet = () => {
  return (
    <FormControl>
      <CodeEditorWithVariables
        defaultValue="npm install @urbiport/js @urbiport/react"
        isReadOnly
        lang="shell"
      />
    </FormControl>
  )
}
