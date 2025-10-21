import { ButtonGroup, IconButton, SlideFade } from '@chakra-ui/react'
import { ToolIcon, CopyIcon, TrashIcon } from '@urbiport/icons'
import { useTranslate } from '@tolgee/react'
import React from 'react'

type ActionsBarProps = {
  isVisible: boolean
  onOpenSettings: () => void
  onDuplicate: () => void
  onDelete: () => void
  isDeleteDisabled?: boolean
  isOpenSettingsHidden?: boolean
  position?: {
    left?: string
    right?: string
    top?: string
    bottom?: string
  }
}

export const ActionsBar = ({
  isVisible,
  onOpenSettings,
  onDuplicate,
  onDelete,
  isDeleteDisabled = false,
  isOpenSettingsHidden = false,
  position = { left: '123px', top: '-50px' },
}: ActionsBarProps) => {
  const { t } = useTranslate()

  return (
    <SlideFade
      in={isVisible}
      style={{
        position: 'absolute',
        left: position.left,
        right: position.right,
        top: position.top,
        bottom: position.bottom,
        zIndex: 3,
        transform: position.top === '50%' ? 'translateY(-50%)' : undefined,
      }}
      unmountOnExit
    >
      <ButtonGroup
        isAttached={true}
        variant="outline"
        size="sm"
        bg="bg.dark"
        borderRadius="md"
        borderWidth="1px"
        shadow="md"
      >
        {!isOpenSettingsHidden && (
          <IconButton
            aria-label={t('blocks.inputs.button.openSettings.ariaLabel')}
            icon={<ToolIcon />}
            variant="ghost"
            onClick={onOpenSettings}
            borderRightWidth="1px"
            borderRightRadius="none"
          />
        )}
        <IconButton
          aria-label="Duplicate item"
          icon={<CopyIcon />}
          variant="ghost"
          onClick={onDuplicate}
          borderRightWidth="1px"
          borderLeftRadius="none"
          borderRightRadius="none"
        />
        <IconButton
          aria-label="Delete item"
          icon={<TrashIcon />}
          variant="ghost"
          onClick={onDelete}
          isDisabled={isDeleteDisabled}
          opacity={isDeleteDisabled ? 0.4 : 1}
          cursor={isDeleteDisabled ? 'not-allowed' : 'pointer'}
          borderLeftRadius="none"
        />
      </ButtonGroup>
    </SlideFade>
  )
}
