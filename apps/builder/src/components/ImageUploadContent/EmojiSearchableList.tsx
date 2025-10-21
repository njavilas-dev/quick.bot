import emojiTagsData from 'emojilib'
import { useState, useEffect, useRef } from 'react'
import { Stack, SimpleGrid, GridItem, Button } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import emojis from './emojiList.json'
import { FormControl, InputText, H4 } from '@urbiport/ui'
import { useStorage } from '@/store/storage/useStorage'

const emojiTags = emojiTagsData as Record<string, string[]>

const people = emojis['Smileys & Emotion'].concat(emojis['People & Body'])
const nature = emojis['Animals & Nature']
const food = emojis['Food & Drink']
const activities = emojis['Activities']
const travel = emojis['Travel & Places']
const objects = emojis['Objects']
const symbols = emojis['Symbols']
const flags = emojis['Flags']

type Props = {
  onChange: (emoji: string) => void
}

export const EmojiSearchableList = ({ onChange }: Props) => {
  const { getRecentEmojis, updateRecentEmojis } = useStorage()

  const scrollContainer = useRef<HTMLDivElement>(null)
  const bottomElement = useRef<HTMLDivElement>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [filteredPeople, setFilteredPeople] = useState(people)
  const [filteredAnimals, setFilteredAnimals] = useState(nature)
  const [filteredFood, setFilteredFood] = useState(food)
  const [filteredTravel, setFilteredTravel] = useState(travel)
  const [filteredActivities, setFilteredActivities] = useState(activities)
  const [filteredObjects, setFilteredObjects] = useState(objects)
  const [filteredSymbols, setFilteredSymbols] = useState(symbols)
  const [filteredFlags, setFilteredFlags] = useState(flags)
  const [totalDisplayedCategories, setTotalDisplayedCategories] = useState(1)
  const [recentEmojis, setRecentEmojis] = useState(getRecentEmojis())
  const { t } = useTranslate()

  useEffect(() => {
    if (!bottomElement.current) return
    const observer = new IntersectionObserver(handleObserver, {
      root: scrollContainer.current,
    })
    if (bottomElement.current) observer.observe(bottomElement.current)
    return () => {
      observer.disconnect()
    }
  }, [])

  const handleObserver = (entities: IntersectionObserverEntry[]) => {
    const target = entities[0]
    if (target.isIntersecting) setTotalDisplayedCategories((c) => c + 1)
  }

  const handleSearchChange = async (searchValue: string) => {
    if (searchValue.length <= 2 && isSearching) return resetEmojiList()
    setIsSearching(true)
    setTotalDisplayedCategories(8)
    const byTag = (emoji: string) => emojiTags[emoji].find((tag) => tag.includes(searchValue))
    setFilteredPeople(people.filter(byTag))
    setFilteredAnimals(nature.filter(byTag))
    setFilteredFood(food.filter(byTag))
    setFilteredTravel(travel.filter(byTag))
    setFilteredActivities(activities.filter(byTag))
    setFilteredObjects(objects.filter(byTag))
    setFilteredSymbols(symbols.filter(byTag))
    setFilteredFlags(flags.filter(byTag))
  }

  const resetEmojiList = () => {
    setTotalDisplayedCategories(1)
    setIsSearching(false)
    setFilteredPeople(people)
    setFilteredAnimals(nature)
    setFilteredFood(food)
    setFilteredTravel(travel)
    setFilteredActivities(activities)
    setFilteredObjects(objects)
    setFilteredSymbols(symbols)
    setFilteredFlags(flags)
  }

  const selectEmoji = (emoji: string) => {
    const updatedRecentEmojis = [...new Set([emoji, ...recentEmojis].slice(0, 30))]
    updateRecentEmojis(updatedRecentEmojis)
    setRecentEmojis(updatedRecentEmojis)
    onChange(emoji)
  }

  return (
    <>
      <FormControl>
        <InputText
          placeholder={t('emojiList.searchInput.placeholder')}
          onChange={handleSearchChange}
          mb={3}
        />
      </FormControl>
      <Stack ref={scrollContainer} overflowY="auto" maxH="20vh" spacing={2}>
        {recentEmojis.length > 0 && (
          <>
            <H4>{t('emojiList.categories.recent.label')}</H4>
            <EmojiGrid emojis={recentEmojis} onEmojiClick={selectEmoji} />
          </>
        )}
        {filteredPeople.length > 0 && (
          <>
            <H4>{t('emojiList.categories.people.label')}</H4>
            <EmojiGrid emojis={filteredPeople} onEmojiClick={selectEmoji} />
          </>
        )}
        {filteredAnimals.length > 0 && totalDisplayedCategories >= 2 && (
          <>
            <H4>{t('emojiList.categories.animalsAndNature.label')}</H4>
            <EmojiGrid emojis={filteredAnimals} onEmojiClick={selectEmoji} />
          </>
        )}
        {filteredFood.length > 0 && totalDisplayedCategories >= 3 && (
          <>
            <H4>{t('emojiList.categories.foodAndDrink.label')}</H4>
            <EmojiGrid emojis={filteredFood} onEmojiClick={selectEmoji} />
          </>
        )}
        {filteredTravel.length > 0 && totalDisplayedCategories >= 4 && (
          <>
            <H4>{t('emojiList.categories.travelAndPlaces.label')}</H4>
            <EmojiGrid emojis={filteredTravel} onEmojiClick={selectEmoji} />
          </>
        )}
        {filteredActivities.length > 0 && totalDisplayedCategories >= 5 && (
          <>
            <H4>{t('emojiList.categories.activities.label')}</H4>
            <EmojiGrid emojis={filteredActivities} onEmojiClick={selectEmoji} />
          </>
        )}
        {filteredObjects.length > 0 && totalDisplayedCategories >= 6 && (
          <>
            <H4>{t('emojiList.categories.objects.label')}</H4>
            <EmojiGrid emojis={filteredObjects} onEmojiClick={selectEmoji} />
          </>
        )}
        {filteredSymbols.length > 0 && totalDisplayedCategories >= 7 && (
          <>
            <H4>{t('emojiList.categories.symbols.label')}</H4>
            <EmojiGrid emojis={filteredSymbols} onEmojiClick={selectEmoji} />
          </>
        )}
        {filteredFlags.length > 0 && totalDisplayedCategories >= 8 && (
          <>
            <H4>{t('emojiList.categories.flags.label')}</H4>
            <EmojiGrid emojis={filteredFlags} onEmojiClick={selectEmoji} />
          </>
        )}
        <div ref={bottomElement} />
      </Stack>
    </>
  )
}

const EmojiGrid = ({
  emojis,
  onEmojiClick,
}: {
  emojis: string[]
  onEmojiClick: (emoji: string) => void
}) => {
  const handleClick = (emoji: string) => () => onEmojiClick(emoji)
  return (
    <SimpleGrid
      spacing={0}
      gridTemplateColumns={`repeat(auto-fill, minmax(32px, 1fr))`}
      borderRadius="md"
    >
      {emojis.map((emoji) => (
        <GridItem
          as={Button}
          onClick={handleClick(emoji)}
          variant="ghost"
          size="sm"
          fontSize="xl"
          key={emoji}
        >
          {emoji}
        </GridItem>
      ))}
    </SimpleGrid>
  )
}
