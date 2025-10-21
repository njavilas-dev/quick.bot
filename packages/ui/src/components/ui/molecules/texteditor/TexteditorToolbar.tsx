import React from 'react'
import { HStack } from '@chakra-ui/react'
import { MARK_BOLD, MARK_ITALIC, MARK_UNDERLINE } from '@udecode/plate-basic-marks'
import { getPluginType, useEditorRef, PlateEditor } from '@udecode/plate-core'
import { BoldIcon, ItalicIcon, UnderlineIcon, LinkIcon } from '@urbiport/icons'
import { MarkToolbarButton } from './plate/MarkToolbarButton'
import { LinkToolbarButton } from './plate/LinkToolbarButton'

export type ToolbarItem = {
  id: string
  render: (editor: PlateEditor) => React.ReactNode
}

interface TexteditorToolbarProps {
  toolbarItems?: ToolbarItem[]
}

export const TexteditorToolbar: React.FC<TexteditorToolbarProps> = ({ toolbarItems = [] }) => {
  const editor = useEditorRef()

  const items: ToolbarItem[] = [
    ...toolbarItems,
    {
      id: 'bold-button',
      render: () => (
        <MarkToolbarButton nodeType={getPluginType(editor, MARK_BOLD)} icon={<BoldIcon />} />
      ),
    },
    {
      id: 'italic-button',
      render: () => (
        <MarkToolbarButton nodeType={getPluginType(editor, MARK_ITALIC)} icon={<ItalicIcon />} />
      ),
    },
    {
      id: 'underline-button',
      render: () => (
        <MarkToolbarButton
          nodeType={getPluginType(editor, MARK_UNDERLINE)}
          icon={<UnderlineIcon />}
        />
      ),
    },
    {
      id: 'link-button',
      render: () => <LinkToolbarButton icon={<LinkIcon />} aria-label="Add link" />,
    },
  ]

  return (
    <HStack
      bgColor="bg.dark"
      borderTopRadius="md"
      p={2}
      w="full"
      borderColor="divider.light"
      borderBottomWidth={1}
    >
      {items.map((item) => (
        <span key={item.id} data-testid={item.id}>
          {item.render(editor)}
        </span>
      ))}
    </HStack>
  )
}
