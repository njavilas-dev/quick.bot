import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { FormControl } from '@urbiport/ui'

export const InstallNextjsPackageSnippet = () => {


  return (
    <FormControl>
      <CodeEditorWithVariables
        defaultValue="npm install @urbiport/js @urbiport/nextjs"
        isReadOnly
        lang="shell"
      />
    </FormControl>
  )
}
