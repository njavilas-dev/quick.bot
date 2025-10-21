import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { InputTextProps } from '@urbiport/ui'
import {
  Box,
  Button,
  Popover,
  PopoverAnchor,
  PopoverContent,
  Portal,
  useDisclosure,
  useOutsideClick,
} from '@chakra-ui/react'
import { InputTextWithVariables } from './InputTextWithVariables'
import { isDefined, isRefObject } from '@quickbot.io/lib'

type Item =
  | {
    label: string
    value: string
    icon?: JSX.Element
  }
  | string
  | number

const getItemLabel = (item?: Item): string => {
  if (!item) return ''
  if (typeof item === 'object') return item.label
  return item.toString()
}

const getItemValue = (item: Item): string => {
  if (typeof item === 'object') return item.value
  return item.toString()
}

type ExtendedInputTextProps = {
  items?: Item[]
  debounceTimeout?: number
  withVariableButton?: boolean
} & InputTextProps

export const InputTextWithAutocomplete = forwardRef<
  HTMLInputElement & HTMLTextAreaElement,
  ExtendedInputTextProps
>(({ items, defaultValue, onChange, ...props }, forwardRef) => {
  const [width, setWidth] = useState<string | number>('auto')
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([])
  const localRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null)
  const ref = isRefObject(forwardRef) ? forwardRef : localRef
  const containerRef = useRef<HTMLDivElement>(null)

  const [keyboardFocusIndex, setKeyboardFocusIndex] = useState<number | undefined>()

  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    const updateWidth = () => {
      if (ref.current) {
        setWidth(`${ref.current.offsetWidth}px`)
      }
    }

    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [ref])

  useOutsideClick({
    ref: ref,
    handler: (event) => {
      const isClickInsideParent = [containerRef]?.some((parentRef) =>
        parentRef.current?.contains(event.target as Node),
      )

      if (!isClickInsideParent) {
        onClose()
      }
    },
  })

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredItems.length > 0 && !isOpen) {
      onOpen()
    }

    if (e.key === 'Enter' && isDefined(keyboardFocusIndex)) {
      handleItemClick(filteredItems[keyboardFocusIndex])()
      return setKeyboardFocusIndex(undefined)
    }
    if (e.key === 'ArrowDown') {
      if (keyboardFocusIndex === undefined) return setKeyboardFocusIndex(0)
      if (keyboardFocusIndex === filteredItems.length - 1) return setKeyboardFocusIndex(0)
      itemsRef.current[keyboardFocusIndex + 1]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
      return setKeyboardFocusIndex(keyboardFocusIndex + 1)
    }
    if (e.key === 'ArrowUp') {
      if (keyboardFocusIndex === 0 || keyboardFocusIndex === undefined)
        return setKeyboardFocusIndex(filteredItems.length - 1)
      itemsRef.current[keyboardFocusIndex - 1]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
      setKeyboardFocusIndex(keyboardFocusIndex - 1)
    }
  }

  const handleOnFocus = () => {
    if (filteredItems.length > 0) onOpen()
  }

  const handleItemClick = (item: Item) => () => {
    const value = getItemValue(item)
    onChange?.(value)
    setKeyboardFocusIndex(undefined)
    // onClose()
    ref?.current?.focus()
  }

  const filteredItems = (
    defaultValue === ''
      ? items ?? []
      : [
        ...(items ?? []).filter((item) => {
          const label = getItemLabel(item).toLowerCase()
          const value = defaultValue?.toLowerCase()
          return !value || (label.startsWith(value) && label !== value)
        }),
      ]
  ).slice(0, 50)

  return (
    <Popover
      isLazy
      isOpen={isOpen}
      onOpen={onOpen}
      initialFocusRef={ref}
      autoFocus={false}
      placement="bottom-start"
      closeOnBlur={true}
    >
      <PopoverAnchor>
        <Box>
          <InputTextWithVariables
            ref={ref}
            {...props}
            autoComplete="off"
            defaultValue={defaultValue}
            onChange={onChange}
            onFocus={handleOnFocus}
            onKeyDown={handleOnKeyDown}
          />
        </Box>
      </PopoverAnchor>
      <Portal>
        <PopoverContent maxH="35vh" overflowY="auto" width={width} ref={containerRef}>
          <>
            {filteredItems?.map((item, index) => {
              const label = getItemLabel(item)
              return (
                <Button
                  key={label}
                  ref={(el) => (itemsRef.current[index] = el)}
                  variant="ghost"
                  onClick={handleItemClick(item)}
                >
                  {label}
                </Button>
              )
            })}
          </>
        </PopoverContent>
      </Portal>
    </Popover>
  )
})

InputTextWithAutocomplete.displayName = 'InputTextWithAutocomplete'
