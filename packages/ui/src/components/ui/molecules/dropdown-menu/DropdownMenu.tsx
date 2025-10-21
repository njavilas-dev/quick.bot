import React, { useEffect, useRef } from 'react'
import {
  Menu,
  MenuButton,
  MenuList,
  Button,
  MenuProps,
  ButtonProps,
  Portal,
  IconButtonProps,
  useOutsideClick,
  useDisclosure,
  IconButton,
} from '@chakra-ui/react'

export type DropdownMenuProps = {
  menuButton?: React.ReactNode
  children?: React.ReactNode
  placement?: 'bottom' | 'bottom-end' | 'bottom-start' | 'top' | 'top-end' | 'top-start'
  closeOnSelect?: boolean
  menuProps?: MenuProps
  menuButtonProps?: ButtonProps | IconButtonProps
  usePortal?: boolean
  menuParentRefs?: React.RefObject<HTMLElement>[]
  matchWidth?: boolean
  width?: string | number
  menuMaxW?: string | number
  setRefStatus?: (status: boolean) => void
  outsideClick?: boolean
  zIndex?: number | string
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  placement = 'bottom',
  matchWidth = true,
  closeOnSelect = true,
  width,
  children,
  usePortal = true,
  menuParentRefs = [],
  menuProps,
  menuButton,
  menuButtonProps,
  menuMaxW = '100%',
  setRefStatus,
  outsideClick = true,
  zIndex = 'dropdown',
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const menuListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setRefStatus?.(isOpen)
  }, [isOpen, setRefStatus])

  useOutsideClick({
    ref: menuListRef,
    handler: (event) => {
      if (!outsideClick) return

      const isClickInsideMenuButton = menuButtonRef.current?.contains(event.target as Node)
      const isClickInsideParent =
        menuParentRefs.length > 0
          ? menuParentRefs?.some((parentRef) => parentRef.current?.contains(event.target as Node))
          : false

      if (!isClickInsideMenuButton && !isClickInsideParent) {
        onClose()
      }
    },
  })

  const menuListElement = (
    <MenuList
      ref={menuListRef}
      py={2}
      px={2}
      borderRadius="md"
      borderColor="divider.light"
      bg="bg.normal"
      shadow="lg"
      maxH="35vh"
      overflowY="auto"
      zIndex={zIndex}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      maxW={menuMaxW}
      width="auto"
      minWidth="unset"
    >
      {children}
    </MenuList>
  )
  const isIconButton = menuButtonProps?.as === IconButton

  return (
    <Menu
      isLazy
      placement={placement}
      closeOnSelect={closeOnSelect}
      matchWidth={matchWidth}
      closeOnBlur={false}
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      {...menuProps}
    >
      <MenuButton
        ref={menuButtonRef}
        as={Button}
        variant="outline"
        bg="bg.normal"
        _hover={{ bg: 'transparent' }}
        sx={{
          span: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: isIconButton ? 'center' : 'space-between',
          },
        }}
        width={width}
        {...menuButtonProps}
      >
        {menuButton}
      </MenuButton>
      {usePortal ? <Portal>{menuListElement}</Portal> : menuListElement}
    </Menu>
  )
}
