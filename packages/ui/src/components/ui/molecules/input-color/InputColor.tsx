import React, { useMemo, useRef, useCallback } from 'react'
import { rgbaToHex } from '@uiw/color-convert'
import {
  Button,
  ButtonProps,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Text,
  useDisclosure,
  useOutsideClick,
} from '@chakra-ui/react'
import { ColorPicker } from '../color-picker'
import { ColorPill } from '../color-pill'

type InputColorProps = {
  defaultValue?: string
  onChange: (color: string) => void
  placement?:
    | 'auto'
    | 'auto-start'
    | 'auto-end'
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'right'
    | 'right-start'
    | 'right-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'left-start'
    | 'left-end'
  usePortal?: boolean
} & Omit<ButtonProps, 'defaultValue' | 'onChange'>

const convertColor = (color: string) => {
  if (!color) return { hex: '#FFFFFF', opacity: 1 }

  if (color.startsWith('#')) {
    return { hex: color, opacity: 1 }
  }

  try {
    const [r, g, b, a] = color.match(/\d+(\.\d+)?/g)?.map(Number) || [255, 255, 255, 1]
    return { hex: rgbaToHex({ r, g, b, a }), opacity: a ?? 1 }
  } catch {
    return { hex: '#FFFFFF', opacity: 1 }
  }
}

export const InputColor: React.FC<InputColorProps> = ({
  defaultValue = '#FFFFFF',
  onChange,
  placement = 'right-start',
  usePortal = false,
  ...props
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const contentRef = useRef<HTMLDivElement>(null)

  const handleOutsideClick = useCallback(
    (event: Event) => {
      const target = event.target as HTMLElement

      // Check if click is on Sketch color picker elements - don't close if so
      if (
        target.closest('.w-color-interactive') ||
        target.closest('.w-color-saturation') ||
        target.closest('.w-color-hue') ||
        target.closest('.w-color-alpha') ||
        target.closest('.w-color-sketch') ||
        target.classList.contains('w-color-interactive') ||
        target.classList.contains('w-color-saturation')
      ) {
        return // Don't close popover for Sketch color picker interactions
      }

      onClose()
    },
    [onClose],
  )

  useOutsideClick({
    ref: contentRef,
    handler: handleOutsideClick,
    enabled: isOpen,
  })

  const colorConverted = useMemo(() => convertColor(defaultValue), [defaultValue])

  const popoverContent = (
    <PopoverContent w="300px" ref={contentRef}>
      <PopoverBody p={3}>
        <ColorPicker color={defaultValue} setColor={onChange} />
      </PopoverBody>
    </PopoverContent>
  )

  return (
    <Popover
      placement={placement}
      isOpen={isOpen}
      onClose={onClose}
      closeOnBlur={false}
      closeOnEsc={true}
    >
      <PopoverTrigger>
        <Button
          onClick={onOpen}
          variant="outline"
          px={3}
          gap={0}
          minW="auto"
          minH="auto"
          leftIcon={<ColorPill color={defaultValue} borderRadius="4px" />}
          rightIcon={
            <Text color="gray.600" whiteSpace="nowrap">
              {`${(colorConverted.opacity * 100).toFixed(0)}%`}
            </Text>
          }
          {...props}
        >
          <Text color="gray.600" whiteSpace="nowrap" mr="auto">
            #{colorConverted.hex.slice(1)}
          </Text>
        </Button>
      </PopoverTrigger>
      {usePortal ? <Portal>{popoverContent}</Portal> : popoverContent}
    </Popover>
  )
}
