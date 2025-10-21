import { AnimatePresence, motion } from 'framer-motion'
import React, { useRef, useState } from 'react'
import { Tag, IconButton, Wrap, Text, WrapItem } from '@chakra-ui/react'
import { CloseIcon } from '@urbiport/icons'
import { InputText } from '../../atoms'

type Props = {
  items?: string[]
  placeholder?: string
  onChange: (value: string[]) => void
}

const convertStrToList = (str: string): string[] => {
  const splittedBreakLines = str.split('\n')
  const splittedCommas = str.split(',')
  const isPastingMultipleItems =
    str.length > 1 && (splittedBreakLines.length >= 2 || splittedCommas.length >= 2)
  if (isPastingMultipleItems) {
    const values = splittedBreakLines.length >= 2 ? splittedBreakLines : splittedCommas
    return values.map((v) => v.trim())
  }
  return [str.trim()]
}

export const InputTags = ({ items, placeholder, onChange }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState('')
  const [focusedTagIndex, setFocusedTagIndex] = useState<number>()

  const handleInputChange = (newTag: string) => {
    setFocusedTagIndex(undefined)
    setInputValue(newTag)
    if (newTag.length - inputValue.length > 0) {
      const values = convertStrToList(newTag)
      if (values.length > 1) {
        onChange([...(items ?? []), ...convertStrToList(newTag)])
        setInputValue('')
      }
    }
  }
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!items) return

    if (e.key === 'Backspace') {
      if (focusedTagIndex !== undefined) {
        if (focusedTagIndex === items.length - 1) {
          setFocusedTagIndex((idx) => idx! - 1)
        }
        removeItem(focusedTagIndex)
        return
      }
      if (inputValue === '' && focusedTagIndex === undefined) {
        setFocusedTagIndex(items?.length - 1)
        return
      }
    }

    if (e.key === 'ArrowLeft') {
      if (focusedTagIndex !== undefined) {
        if (focusedTagIndex === 0) return
        setFocusedTagIndex(focusedTagIndex - 1)
        return
      }
      if (inputRef.current?.selectionStart === 0 && items) {
        setFocusedTagIndex(items.length - 1)
        return
      }
    }
    if (e.key === 'ArrowRight' && focusedTagIndex !== undefined) {
      if (focusedTagIndex === items.length - 1) {
        setFocusedTagIndex(undefined)
        return
      }
      setFocusedTagIndex(focusedTagIndex + 1)
    }
  }

  const removeItem = (index: number) => {
    if (!items) return
    const newItems = [...items]
    newItems.splice(index, 1)
    onChange(newItems)
  }

  const addItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (inputValue === undefined || inputValue === null || inputValue === '') return
    setInputValue('')
    onChange(items ? [...items, inputValue.trim()] : [inputValue.trim()])
  }

  return (
    <Wrap onKeyDown={handleKeyDown}>
      <AnimatePresence mode="popLayout">
        {items?.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, transform: 'translateY(5px)' }}
            animate={{ opacity: 1, transform: 'translateY(0)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <WrapItem>
              <Tag borderWidth="1px" borderColor="divider.normal">
                <Text fontSize="sm" noOfLines={1}>
                  {`${item?.slice(0, 20)}...`}
                </Text>
                <IconButton
                  size="xs"
                  icon={<CloseIcon />}
                  aria-label="Remove tag"
                  variant="unstyled"
                  onClick={() => removeItem(index)}
                />
              </Tag>
            </WrapItem>
          </motion.div>
        ))}
      </AnimatePresence>
      <WrapItem w={'100%'}>
        <form onSubmit={addItem} style={{ width: '100%' }}>
          <InputText
            
            defaultValue={inputValue}
            onChange={handleInputChange}
            placeholder={items && items.length === 0 ? placeholder : undefined}
          />
        </form>
      </WrapItem>
    </Wrap>
  )
}
