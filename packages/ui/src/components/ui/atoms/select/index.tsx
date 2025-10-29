import React, { useState, useEffect, useRef } from 'react'
import { FixedSizeList as List } from 'react-window'
import {
  MenuItem,
  Input,
  InputGroup,
  InputRightElement,
  HStack,
  IconButton,
  Text,
  Box,
} from '@chakra-ui/react'
import { ChevronDownIcon, CloseIcon, CheckIcon } from '@urbiport/icons'
import { DropdownMenu, DropdownMenuProps } from '../../molecules'
import {
  SelectItem,
  ValueOf,
  getItemLabel,
  getItemValue,
  useSingleSelect,
} from '../../../../hooks/use-select'

type SelectBaseProps<Item> = DropdownMenuProps & {
  withClear?: boolean
  withSearch?: boolean
  width?: string | number
  placeholder?: string
  items: readonly Item[]
  defaultValue?: ValueOf<Item>
  isDisabled?: boolean
  zIndex?: number
}

type OnSelectWithClear<Item> = (value: ValueOf<Item> | undefined, item?: Item) => void

type OnSelectWithoutClear<Item> = (value: ValueOf<Item>, item?: Item) => void

export type ExtendedSelectWithClearProps<Item> = SelectBaseProps<Item> & {
  withClear?: true
  selectedItem: ValueOf<Item>
  onSelect: OnSelectWithClear<Item>
}

export type ExtendedSelectWithoutClearProps<Item> = SelectBaseProps<Item> & {
  withClear?: false
  selectedItem?: ValueOf<Item>
  onSelect: OnSelectWithoutClear<Item>
}

export type SelectProps<Item> =
  | ExtendedSelectWithoutClearProps<Item>
  | ExtendedSelectWithClearProps<Item>

export const Select = <T extends SelectItem>(props: SelectProps<T>) => {
  const {
    withClear = true,
    withSearch = true,
    selectedItem,
    onSelect,
    items,
    placeholder = 'Select...',
    defaultValue,
    isDisabled,
    zIndex,
    ...dropdownProps
  } = props

  const [inputValue, setInputValue] = useState<string | undefined>('')
  const listRef = useRef<List>(null)

  const [refStatus, setRefStatus] = useState<boolean>(false)

  const {
    searchValue,
    filteredItems,
    updateSearchValue,
    calculateListHeight,
    currentItem,
    currentValue,
    shouldUseVirtualList,
  } = useSingleSelect(items, selectedItem)

  useEffect(() => {
    setInputValue(getItemLabel(currentItem))
  }, [currentItem])

  // Additional effect to sync correctly at the beginning
  useEffect(() => {
    const item = items.find((item) => selectedItem === getItemValue(item))
    setInputValue(getItemLabel(item))
  }, [])

  useEffect(() => {
    if (refStatus && shouldUseVirtualList && listRef.current && currentValue) {
      const selectedIndex = filteredItems.findIndex((item) => getItemValue(item) === currentValue)
      if (selectedIndex !== -1) {
        listRef.current.scrollToItem(selectedIndex, 'smart')
      }
    }
  }, [refStatus, filteredItems, currentValue, shouldUseVirtualList])

  const handleItemClick = (item: T) => {
    const itemValue = getItemValue(item) as ValueOf<T>
    if (itemValue === currentValue) return
    if (withClear) {
      ;(onSelect as OnSelectWithClear<T>)(itemValue, item)
    } else {
      ;(onSelect as OnSelectWithoutClear<T>)(itemValue, item)
    }
  }

  const clearSelection = (e: React.MouseEvent) => {
    if (!withClear) return
    e.preventDefault()
    setInputValue(undefined)
    updateSearchValue({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)
    ;(onSelect as OnSelectWithClear<T>)(defaultValue, undefined)
  }

  const clearSearch = (e: React.MouseEvent) => {
    if (!withSearch) return
    e.preventDefault()
    updateSearchValue({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)
  }

  const renderRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = filteredItems[index]
    const itemValue = getItemValue(item)
    const itemLabel = getItemLabel(item)

    const isSelected = currentValue === itemValue
    const isObject = typeof item === 'object' && item !== null
    const isDisabled = isObject && 'isDisabled' in item ? item.isDisabled : false
    const badge = isObject && 'badge' in item ? item.badge : undefined

    return (
      <MenuItem
        isDisabled={isDisabled}
        key={index}
        style={style}
        icon={typeof item === 'object' ? item.icon : undefined}
        onClick={() => handleItemClick(item)}
      >
        <HStack justifyContent="space-between" w="full">
          <Text>{itemLabel}</Text>
          <HStack spacing={2}>
            {badge}
            {isSelected ? (
              <IconButton
                as="span"
                icon={<CheckIcon />}
                aria-label="Selected"
                size="sm"
                variant="ghost"
              />
            ) : (
              <IconButton
                as="span"
                icon={<CheckIcon visibility="hidden" />}
                aria-label="Not Selected"
                size="sm"
                variant="ghost"
              />
            )}
          </HStack>
        </HStack>
      </MenuItem>
    )
  }

  const getRightIcon = () => {
    if (selectedItem && withClear) {
      return (
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton
            as="span"
            onClick={clearSelection}
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

  const dropdownRef = useRef<HTMLDivElement>(null)

  const listHeight = calculateListHeight(filteredItems.length)

  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }} ref={dropdownRef}>
      <DropdownMenu
        setRefStatus={setRefStatus}
        {...dropdownProps}
        width="100%"
        zIndex={zIndex}
        menuButtonProps={{
          ...props.menuButtonProps,
          rightIcon: getRightIcon(),
          isDisabled,
        }}
        menuButton={inputValue || placeholder}
      >
        {withSearch && (
          <InputGroup mb={2} mt={0}>
            <Input
              type="text"
              autoComplete="off"
              value={searchValue}
              placeholder={placeholder}
              onChange={updateSearchValue}
              _hover={{ bg: 'transparent' }}
            />
            {searchValue && (
              <InputRightElement>
                <IconButton
                  onClick={clearSearch}
                  icon={<CloseIcon />}
                  aria-label="Clear search"
                  size="sm"
                  variant="ghost"
                />
              </InputRightElement>
            )}
          </InputGroup>
        )}
        {shouldUseVirtualList ? (
          <List
            ref={listRef}
            height={listHeight}
            itemCount={filteredItems.length}
            itemSize={40}
            width={'100%'}
          >
            {renderRow}
          </List>
        ) : (
          <>
            {filteredItems.map((__, index) => {
              return renderRow({ index, style: { maxHeight: 40, minHeight: 40 } })
            })}
          </>
        )}
      </DropdownMenu>
    </div>
  )
}
