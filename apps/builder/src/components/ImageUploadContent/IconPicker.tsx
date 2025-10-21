import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslate } from '@tolgee/react'
import { Button, Stack, Image, SimpleGrid, IconButton } from '@chakra-ui/react'
import { FormControl, H4, ColorPicker, ColorPill, DropdownMenu } from '@urbiport/ui'
import { InputTextWithVariables } from '../inputs'
import iconList from './iconList.json'
import { useStorage } from '@/store/storage/useStorage'

const batchSize = 200

type Props = {
  onChange: (url: string) => void
}

export const IconPicker = ({ onChange }: Props) => {
  const { getRecentIconNames, updateRecentIconNames, getDefaultIconColor, updateDefaultIconColor } =
    useStorage()

  const scrollContainer = useRef<HTMLDivElement>(null)
  const bottomElement = useRef<HTMLDivElement>(null)
  const [displayedIconNames, setDisplayedIconNames] = useState(iconList.slice(0, batchSize))
  const searchQuery = useRef<string>('')
  const [selectedColor, setSelectedColor] = useState(getDefaultIconColor())

  const [recentIconNames, setRecentIconNames] = useState(getRecentIconNames())
  const { t } = useTranslate()

  useEffect(() => {
    if (!bottomElement.current) return
    const observer = new IntersectionObserver(handleObserver, {
      root: scrollContainer.current,
      rootMargin: '200px',
    })
    if (bottomElement.current) observer.observe(bottomElement.current)
    return () => {
      observer.disconnect()
    }
  }, [])

  const handleObserver = (entities: IntersectionObserverEntry[]) => {
    const target = entities[0]
    if (target.isIntersecting && searchQuery.current.length <= 2)
      setDisplayedIconNames((displayedIconNames) => [
        ...displayedIconNames,
        ...iconList.slice(displayedIconNames.length, displayedIconNames.length + batchSize),
      ])
  }

  const searchIcon = async (query: string) => {
    searchQuery.current = query
    if (query.length <= 2) return setDisplayedIconNames(iconList.slice(0, batchSize))
    const filteredIconNames = iconList.filter((iconName) =>
      iconName.toLowerCase().includes(query.toLowerCase()),
    )
    setDisplayedIconNames(filteredIconNames)
  }

  const updateColor = (color: string) => {
    updateDefaultIconColor(color)
    setSelectedColor(color)
  }

  const selectIcon = async (iconName: string) => {
    const updatedRecentIconNames = [...new Set([iconName, ...recentIconNames].slice(0, 30))]
    updateRecentIconNames(updatedRecentIconNames)
    setRecentIconNames(updatedRecentIconNames)

    const svg = await (await fetch(`/icons/${iconName}.svg`)).text()
    const dataUri = `data:image/svg+xml;utf8,${svg
      .replace('<svg', `<svg fill='${encodeURIComponent(selectedColor)}'`)
      .replace(/"/g, "'")}`
    onChange(dataUri)
  }

  return (
    <>
      <FormControl>
        <InputTextWithVariables
          placeholder={t('emojiList.searchInput.placeholder')}
          onChange={searchIcon}
          rightIcon={
            <DropdownMenu
              placement="bottom-end"
              matchWidth={false}
              closeOnSelect={false}
              menuButton={<ColorPill color={selectedColor} />}
              menuButtonProps={{
                as: IconButton,
                variant: 'unstyled',
                bg: 'transparent',
              }}
              menuMaxW="250px"
            >
              <ColorPicker color={selectedColor} setColor={updateColor} />
            </DropdownMenu>
          }
        />
      </FormControl>
      <Stack ref={scrollContainer} overflowY="auto" maxH="20vh" spacing={2} w={'100%'} mt={3}>
        {recentIconNames.length > 0 && (
          <>
            <H4>RECENT</H4>
            <SimpleGrid
              spacing={0}
              gridTemplateColumns={`repeat(auto-fill, minmax(38px, 1fr))`}
              borderRadius="md"
            >
              {recentIconNames.map((iconName) => (
                <Button
                  size="sm"
                  variant={'ghost'}
                  fontSize="xl"
                  w="38px"
                  h="38px"
                  p="2"
                  key={iconName}
                  onClick={() => selectIcon(iconName)}
                >
                  <Icon name={iconName} color={selectedColor} />
                </Button>
              ))}
            </SimpleGrid>
          </>
        )}
        <>
          {recentIconNames.length > 0 && <H4>ICONS</H4>}
          <SimpleGrid
            spacing={0}
            gridTemplateColumns={`repeat(auto-fill, minmax(38px, 1fr))`}
            borderRadius="md"
          >
            {displayedIconNames.map((iconName) => (
              <Button
                size="sm"
                variant={'ghost'}
                fontSize="xl"
                w="38px"
                h="38px"
                p="2"
                key={iconName}
                onClick={() => selectIcon(iconName)}
              >
                <Icon name={iconName} color={selectedColor} />
              </Button>
            ))}
          </SimpleGrid>
        </>
        <div ref={bottomElement} />
      </Stack>
    </>
  )
}

const Icon = ({ name, color }: { name: string; color: string }) => {
  const [svg, setSvg] = useState('')

  const dataUri = useMemo(
    () =>
      `data:image/svg+xml;utf8,${svg.replace('<svg', `<svg fill='${encodeURIComponent(color)}'`)}`,
    [svg, color],
  )

  useEffect(() => {
    fetch(`/icons/${name}.svg`)
      .then((response) => response.text())
      .then((text) => setSvg(text))
  }, [name])

  if (!svg) return null

  return <Image src={dataUri} alt={name} w="full" h="full" />
}
