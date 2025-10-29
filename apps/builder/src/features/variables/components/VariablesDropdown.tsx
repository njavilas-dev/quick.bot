import React, { useRef, useState } from 'react'
import { useTranslate } from '@tolgee/react'
import { ChevronDownIcon, CloseIcon } from '@urbiport/icons'
import { DropdownMenu, DropdownMenuProps } from '@urbiport/ui'
import { Variable } from '@quickbot.io/schemas'
import { useBot } from '@/features/editor/providers/BotProvider'
import { VariablesList } from './VariablesList'
import { Box, IconButton } from '@chakra-ui/react'

type VariablesDropdownProps = DropdownMenuProps & {
  initialVariableId?: string
  selectedItem?: string
  placeholder?: string
  withClear?: boolean
  onSelect: (variable: Pick<Variable, 'id' | 'name'> | undefined) => void
}

export const VariablesDropdown: React.FC<VariablesDropdownProps> = ({
  initialVariableId,
  onSelect,
  placeholder,
  withClear = true,
  menuButtonProps = {
    'aria-label': 'Select a variable',
    rightIcon: <ChevronDownIcon />,
  },
  ...props
}: VariablesDropdownProps) => {
  const { t } = useTranslate()
  const { bot } = useBot()
  const variables = bot?.variables || []
  const selectedVariable = initialVariableId
    ? variables.find((v: Variable) => v.id === initialVariableId)
    : undefined

  const modalRef = useRef<HTMLDivElement>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleClearSelection = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onSelect(undefined)
  }

  // Determine the right icon based on withClear and current selection
  // Only apply automatic rightIcon if menuButtonProps doesn't have 'icon' (IconButton mode)
  const getRightIcon = () => {
    // If it's an IconButton (has 'icon' prop), don't override the rightIcon
    if ('icon' in menuButtonProps) {
      return undefined
    }

    if (selectedVariable && withClear) {
      return (
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton
            as="span"
            onClick={handleClearSelection}
            icon={<CloseIcon />}
            aria-label="Clear"
            size="xs"
            variant="ghost"
            pointerEvents="all"
            mr={1}
          />
          <ChevronDownIcon />
        </Box>
      )
    }
    return <ChevronDownIcon />
  }

  return (
    <DropdownMenu
      {...props}
      closeOnSelect={true}
      outsideClick={!isModalOpen}
      menuParentRefs={[modalRef]}
      menuButton={selectedVariable ? selectedVariable.name : placeholder || t('variables.select')}
      menuButtonProps={{
        ...menuButtonProps,
        rightIcon: getRightIcon(),
      }}
    >
      <VariablesList
        modalRef={modalRef}
        onSelect={onSelect}
        initialVariableId={initialVariableId}
        onModalStateChange={setIsModalOpen}
      />
    </DropdownMenu>
  )
}
