import React from 'react'
import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Box,
  Menu,
  MenuItem,
  Stack,
  Tabs,
  TabList,
  Tab,
  Text,
  useDisclosure,
  Portal,
  Popover,
  PopoverAnchor,
  PopoverContent,
  useOutsideClick,
  TabPanels,
} from '@chakra-ui/react'
import { NotFoundIcon, SearchIcon, IconComponentType } from '@urbiport/icons'
import { InputText } from '../../atoms'

export type SearchMenuItem = {
  icon: IconComponentType
  text: string
  path: string
}

export type SearchItem = {
  id: number | string
  category: string
  menuItems: SearchMenuItem[]
}

type Props = {
  searchItems: SearchItem[]
  onClick: (path: string) => void
}

export const Search = (props: Props) => {
  const [width, setWidth] = useState<string | number>('auto')
  const [category, setCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleOnChange = (value: string) => {
    if (!isOpen) onOpen()
    setSearchTerm(value)
  }

  const handleChange = useCallback((index: number) => {
    setCategory(['all', 'settings', 'bots'][index])
  }, [])

  const filteredItems =
    category === 'all'
      ? props?.searchItems
      : props?.searchItems?.filter((item) => item?.category === category)

  const handleNavigate = (url: string) => {
    props.onClick(url)
    onClose()
  }

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

  return (
    <Popover
      isLazy
      isOpen={isOpen}
      onOpen={onOpen}
      autoFocus={false}
      placement="bottom-start"
      closeOnBlur={false}
    >
      <PopoverAnchor>
        <Box width={'100%'}>
          <InputText
            ref={ref}
            defaultValue={searchTerm}
            leftIcon={<SearchIcon color="text.light" />}
            placeholder="Search..."
            onChange={handleOnChange}
            width={'100%'}
          />
        </Box>
      </PopoverAnchor>
      <Portal>
        <PopoverContent maxH="35vh" overflowY="auto" width={width} ref={containerRef} p={2}>
          <Menu isOpen>
            <Stack spacing={4}>
              <Stack spacing={2}>
                <Text fontSize="xs" px="16px" color="text.light">
                  Filter by
                </Text>
                <Tabs isFitted colorScheme="green" onChange={handleChange}>
                  <TabList mb={4}>
                    <Tab
                      minWidth="0 !important"
                      width="auto"
                      textTransform="uppercase"
                      fontSize="sm"
                      height="42px"
                      paddingInline="16px"
                    >
                      All
                    </Tab>
                    <Tab
                      minWidth="0 !important"
                      width="auto"
                      textTransform="uppercase"
                      fontSize="sm"
                      height="42px"
                      paddingInline="16px"
                    >
                      Settings
                    </Tab>
                    <Tab
                      minWidth="0 !important"
                      width="auto"
                      textTransform="uppercase"
                      fontSize="sm"
                      height="42px"
                      paddingInline="16px"
                    >
                      Bots
                    </Tab>
                  </TabList>
                  <TabPanels>
                    {filteredItems?.map((item) => (
                      <Stack key={item.id} spacing={2}>
                        <Text fontSize="xs" color="text.light" textTransform="capitalize" px="16px">
                          {item.category}
                        </Text>
                        {item.menuItems.map((menuItem, index) => (
                          <MenuItem
                            key={index}
                            onClick={() => handleNavigate(menuItem.path)}
                            icon={<menuItem.icon />}
                            color="text.light"
                          >
                            <Text color="text.normal" fontWeight="normal" fontSize="sm">
                              {menuItem.text}
                            </Text>
                          </MenuItem>
                        ))}
                      </Stack>
                    ))}
                    {filteredItems?.length === 0 && (
                      <Stack spacing={2} alignItems="center" justifyContent="center">
                        <NotFoundIcon />
                        <Text fontSize="sm" color="text.light">
                          Result not found
                        </Text>
                      </Stack>
                    )}
                  </TabPanels>
                </Tabs>
              </Stack>
            </Stack>
          </Menu>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}
