import React from 'react'
import { VStack } from '@chakra-ui/react'
import { CopyButton } from '../../atoms'

export type ToolbarItem = {
  id: string
  render: (props: CodeEditorToolbarProps) => React.ReactNode
}

interface CodeEditorToolbarProps {
  value: string
  isReadOnly: boolean
  toolbarItems?: ToolbarItem[]
}

export const CodeEditorToolbar: React.FC<CodeEditorToolbarProps> = ({ toolbarItems = [], ...props }) => {

  const items: ToolbarItem[] = [
    {
      id: 'copy-button',
      render: ({ value, isReadOnly }) => value && isReadOnly && (
        <CopyButton
          size="sm"
          textToCopy={value}
        />
      ),
    },
    ...toolbarItems,
  ]

  return (
    <VStack
      pos="absolute"
      right={0}
      top={0}
      m={1}
      spacing={1}
    >
      {items.filter((item) => !!item).map((item) => (
        <span key={item.id} data-testid={item.id}>
          {item.render(props as CodeEditorToolbarProps)}
        </span>
      ))}
    </VStack>
  )
}
