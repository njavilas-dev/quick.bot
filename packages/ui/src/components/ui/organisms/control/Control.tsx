import { Popover, PopoverTrigger, useDisclosure, useOutsideClick } from '@chakra-ui/react'
import { ControlPill, ControlPopoverContent } from '../../molecules'
import React, { useRef, useCallback } from 'react'

type ControlProps = {
  children?: React.ReactNode
  pill?: string
  label: string
  buttonTooltip?: string | React.ReactNode
}

export const Control = ({ children, ...props }: ControlProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const popoverRef = useRef<HTMLDivElement>(null)

  const handleOutsideClick = useCallback((event: Event) => {
    const target = event.target as HTMLElement

    if (
      // Prevent closing when clicking on the color picker itself
      target.closest('.w-color-interactive') ||
      target.closest('.w-color-saturation') ||
      target.closest('.w-color-hue') ||
      target.closest('.w-color-alpha') ||
      target.closest('.w-color-sketch') ||
      target.classList.contains('w-color-interactive') ||
      target.classList.contains('w-color-saturation')
      // Prevent closing when clicking on the parent popover
      || target.closest('.chakra-popover__popper')
    ) {
      return
    }

    onClose()
  }, [onClose])

  useOutsideClick({
    ref: popoverRef,
    handler: handleOutsideClick,
    enabled: isOpen
  })

  if (!children) return <ControlPill {...props} hasPopover={false} />

  return (
    <Popover
      placement="right-start"
      isOpen={isOpen}
      onClose={onClose}
      closeOnBlur={false}  // Disable default closeOnBlur since we handle it custom
      closeOnEsc={true}    // Keep ESC key functionality
    >
      <PopoverTrigger>
        <div onClick={onOpen}>
          <ControlPill isOpen={isOpen} {...props} hasPopover={true} />
        </div>
      </PopoverTrigger>
      <div ref={popoverRef}>
        <ControlPopoverContent>{children}</ControlPopoverContent>
      </div>
    </Popover>
  )
}
