import { useMemo, useState, ChangeEvent } from 'react'

export type SelectItemBase = {
  label: string
  value: string | number
  icon?: JSX.Element
  isDisabled?: boolean
  badge?: React.ReactNode
}

export type SelectItem = SelectItemBase | string | number

export type ValueOf<T> = T extends string
  ? T
  : T extends number
  ? T
  : T extends { value: infer V }
  ? V
  : never

export const getItemLabel = (item?: SelectItem): string => {
  if (!item) return ''
  if (typeof item === 'object') return item.label
  return item.toString()
}

export const getItemValue = (item?: SelectItem): string | number => {
  if (!item) return ''
  if (typeof item === 'object') return item.value
  return item
}

export function useSelectCore<T extends SelectItem>(items: readonly T[]) {
  const [searchValue, setSearchValue] = useState<string>('')

  const filteredItems = useMemo(() => {
    if (!searchValue) return items
    return items.filter((item) =>
      getItemLabel(item).toLowerCase().includes(searchValue.toLowerCase()),
    )
  }, [items, searchValue])

  const updateSearchValue = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }

  const calculateListHeight = (itemCount: number) => {
    const dropdownPadding = 32
    const inputGroupHeight = 40 + 16
    const maxHeight = window.innerHeight * 0.35 - inputGroupHeight - dropdownPadding
    return Math.min(itemCount * 40, maxHeight, 300)
  }

  const clearSearch = () => {
    setSearchValue('')
  }

  return {
    searchValue,
    filteredItems,
    updateSearchValue,
    calculateListHeight,
    clearSearch,
  }
}

export function useSingleSelect<T extends SelectItem>(
  items: readonly T[],
  selectedItem: ValueOf<T> | undefined,
) {
  const { searchValue, filteredItems, updateSearchValue, calculateListHeight, clearSearch } =
    useSelectCore(items)

  const currentItem = useMemo(
    () => items.find((item) => selectedItem === getItemValue(item)),
    [items, selectedItem],
  )

  const currentValue = getItemValue(currentItem)

  const shouldUseVirtualList = filteredItems.length > 20

  return {
    searchValue,
    filteredItems,
    updateSearchValue,
    calculateListHeight,
    clearSearch,
    currentItem,
    currentValue,
    shouldUseVirtualList,
  }
}

export function useMultiSelect<T extends SelectItem>(
  items: readonly T[],
  selectedItems: ValueOf<T>[],
) {
  const { searchValue, filteredItems, updateSearchValue, calculateListHeight, clearSearch } =
    useSelectCore(items)

  const selectedObjects = useMemo(
    () => items.filter((item) => selectedItems.includes(getItemValue(item) as ValueOf<T>)),
    [items, selectedItems],
  )

  return {
    searchValue,
    filteredItems,
    updateSearchValue,
    calculateListHeight,
    clearSearch,
    selectedObjects,
  }
}
