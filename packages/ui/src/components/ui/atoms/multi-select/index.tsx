import React from 'react'
import { FixedSizeList as List } from 'react-window'
import {
  MenuItem,
  Input,
  InputGroup,
  InputRightElement,
  HStack,
  IconButton,
  Text,
} from '@chakra-ui/react'
import { ChevronDownIcon, CloseIcon, CheckIcon } from '@urbiport/icons'
import { DropdownMenu, DropdownMenuProps } from '../../molecules'
import {
  SelectItem,
  ValueOf,
  getItemLabel,
  getItemValue,
  useMultiSelect
} from '../../../../hooks/use-select'

export type MultiSelectItem = SelectItem;

type MultiSelectProps<Item> = DropdownMenuProps & {
  withClear?: boolean;
  width?: string | number;
  placeholder?: string;
  items: readonly Item[];
  selectedItems: ValueOf<Item>[];
  onSelect: (values: ValueOf<Item>[], items: Item[]) => void;
  isDisabled?: boolean;
};

export const MultiSelect = <T extends MultiSelectItem>(props: MultiSelectProps<T>) => {
  const {
    withClear = true,
    selectedItems,
    onSelect,
    items,
    placeholder = 'Select...',
    isDisabled,
  } = props

  const {
    searchValue,
    filteredItems,
    updateSearchValue,
    calculateListHeight,
    selectedObjects,
  } = useMultiSelect(items, selectedItems)

  const handleItemClick = (item: T) => {
    const itemValue = getItemValue(item) as ValueOf<T>
    let newSelectedItems = [...selectedItems]
    let newSelectedObjects = [...selectedObjects]

    if (selectedItems.includes(itemValue)) {
      newSelectedItems = newSelectedItems.filter(value => value !== itemValue)
      newSelectedObjects = newSelectedObjects.filter(obj => getItemValue(obj) !== itemValue)
    } else {
      newSelectedItems.push(itemValue)
      newSelectedObjects.push(item)
    }

    onSelect(newSelectedItems, newSelectedObjects)
  }

  const clearSelection = (e: React.MouseEvent) => {
    if (!withClear) return
    e.preventDefault()
    updateSearchValue({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    onSelect([], [])
  }

  const renderRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = filteredItems[index]
    const itemValue = getItemValue(item)
    const itemLabel = getItemLabel(item)

    const isSelected = selectedItems.includes(itemValue as ValueOf<T>);
    const isObject = typeof item === 'object' && item !== null
    const isDisabled = isObject && 'isDisabled' in item ? item.isDisabled : false

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
          {isSelected && <CheckIcon color="black" />}
        </HStack>
      </MenuItem>
    )
  }

  const listHeight = calculateListHeight(filteredItems.length)

  return (
    <DropdownMenu
      {...props}
      width="100%"
      menuButtonProps={{
        ...props.menuButtonProps,
        rightIcon: <ChevronDownIcon />,
        isDisabled,
      }}
      menuButton={selectedObjects.map(getItemLabel).join(', ') || placeholder}
    >
      <InputGroup mb={2} mt={2}>
        <Input
          type="text"
          autoComplete="off"
          value={searchValue}
          placeholder={placeholder}
          onChange={updateSearchValue}
        />
        {selectedItems.length > 0 && withClear && (
          <InputRightElement>
            <IconButton
              onClick={clearSelection}
              icon={<CloseIcon />}
              aria-label="Clear"
              size="sm"
              variant="ghost"
              pointerEvents="all"
            />
          </InputRightElement>
        )}
      </InputGroup>
      <List
        height={listHeight}
        itemCount={filteredItems.length}
        itemSize={40}
        width="100%"
      >
        {renderRow}
      </List>
    </DropdownMenu>
  )
}