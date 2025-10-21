/* eslint-disable @next/next/no-img-element */
import { createApi } from 'unsplash-js'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  Grid,
  GridItem,
  Image,
  Link,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react'
import { isDefined } from '@quickbot.io/lib'
import { useTranslate } from '@tolgee/react'
import { env } from '@quickbot.io/env'
import { Basic as UnsplashImageType } from 'unsplash-js/dist/methods/photos/types'
import { InputTextWithVariables } from '../inputs'
import { UnsplashLogo } from '@urbiport/icons'
import { TextLink } from '../TextLink'
import { FormControl } from '@urbiport/ui'

const api = createApi({
  accessKey: env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY ?? '',
})

type Props = {
  imageSize?: 'small' | 'regular' | 'thumb'
  onChange: (url: string) => void
}

export const UnsplashPicker = ({ imageSize = 'regular', onChange }: Props) => {
  const { t } = useTranslate()
  const [isFetching, setIsFetching] = useState(false)
  const [images, setImages] = useState<UnsplashImageType[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const scrollContainer = useRef<HTMLDivElement>(null)
  const bottomAnchor = useRef<HTMLDivElement>(null)

  const [nextPage, setNextPage] = useState(0)

  const fetchNewImages = useCallback(async (query: string, page: number) => {
    if (query === '') return searchRandomImages()
    if (query.length <= 2) return
    setError(null)
    setIsFetching(true)
    try {
      const result = await api.search.getPhotos({
        query,
        perPage: 30,
        orientation: 'landscape',
        page,
      })
      if (result.errors) setError(result.errors[0])
      if (isDefined(result.response)) {
        if (page === 0) setImages(result.response.results)
        else setImages((images) => [...images, ...(result.response?.results ?? [])])
        setNextPage((page) => page + 1)
      }
    } catch (err) {
      if (err && typeof err === 'object' && 'message' in err) setError(err.message as string)
      setError('Something went wrong')
    }
    setIsFetching(false)
  }, [])

  useEffect(() => {
    if (!bottomAnchor.current) return
    const observer = new IntersectionObserver(
      (entities: IntersectionObserverEntry[]) => {
        const target = entities[0]
        if (target.isIntersecting) fetchNewImages(searchQuery, nextPage + 1)
      },
      {
        root: scrollContainer.current,
      },
    )
    if (bottomAnchor.current && nextPage > 0) observer.observe(bottomAnchor.current)
    return () => {
      observer.disconnect()
    }
  }, [fetchNewImages, nextPage, searchQuery])

  const searchRandomImages = async () => {
    setError(null)
    setIsFetching(true)
    try {
      const result = await api.photos.getRandom({
        count: 30,
        orientation: 'landscape',
      })

      if (result.errors) setError(result.errors[0])
      if (isDefined(result.response))
        setImages(Array.isArray(result.response) ? result.response : [result.response])
    } catch (err) {
      if (err && typeof err === 'object' && 'message' in err) setError(err.message as string)
      setError('Something went wrong')
    }
    setIsFetching(false)
  }

  const selectImage = (image: UnsplashImageType) => {
    const url = image.urls[imageSize]
    api.photos.trackDownload({
      downloadLocation: image.links.download_location,
    })
    if (isDefined(url)) onChange(url)
  }

  useEffect(() => {
    searchRandomImages()
  }, [])

  if (!env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY)
    return <Text>NEXT_PUBLIC_UNSPLASH_ACCESS_KEY is missing in environment</Text>

  return (
    <>
      <FormControl pt={4}>
        <InputTextWithVariables
          autoFocus
          placeholder={t('unsplashPicker.searchInput.placeholder')}
          onChange={(query) => {
            setSearchQuery(query)
            fetchNewImages(query, 0)
          }}

          rightIcon={
            <Link
              isExternal
              href={`https://unsplash.com/?utm_source=${env.NEXT_PUBLIC_UNSPLASH_APP_NAME}&utm_medium=referral`}
            >
              <UnsplashLogo width="50px" ml="-20px" />
            </Link>
          }
        />
      </FormControl>
      {isDefined(error) && (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}
      <Stack overflowY="auto" maxH="35vh" ref={scrollContainer}>
        {images.length > 0 && (
          <Grid templateColumns="repeat(3, 1fr)" columnGap={2} rowGap={3}>
            {images.map((image, index) => (
              <GridItem
                as={Stack}
                key={image.id}
                boxSize="100%"
                spacing="0"
                ref={index === images.length - 1 ? bottomAnchor : undefined}
              >
                <UnsplashImage image={image} onClick={() => selectImage(image)} />
              </GridItem>
            ))}
          </Grid>
        )}
        {isFetching && (
          <Flex justifyContent="center" py="4">
            <Spinner />
          </Flex>
        )}
      </Stack>
    </>
  )
}

type UnsplashImageProps = {
  image: UnsplashImageType
  onClick: () => void
}

const UnsplashImage = ({ image, onClick }: UnsplashImageProps) => {
  const [isImageHovered, setIsImageHovered] = useState(false)

  const { user, urls, alt_description } = image

  return (
    <Box
      pos="relative"
      onMouseEnter={() => setIsImageHovered(true)}
      onMouseLeave={() => setIsImageHovered(false)}
      h="full"
    >
      <Image
        objectFit="cover"
        src={urls.thumb}
        alt={alt_description ?? 'Unsplash image'}
        onClick={onClick}
        borderRadius="md"
        h="100%"
        cursor="pointer"
      />
      <Box
        pos="absolute"
        bottom={0}
        left={0}
        bgColor="rgba(0,0,0,.5)"
        px="2"
        borderRadius="md"
        opacity={isImageHovered ? 1 : 0}
        transition="opacity .2s ease-in-out"
      >
        <TextLink
          fontSize="xs"
          isExternal
          href={`https://unsplash.com/@${user.username}?utm_source=${env.NEXT_PUBLIC_UNSPLASH_APP_NAME}&utm_medium=referral`}
          noOfLines={1}
          color="white"
        >
          {user.name}
        </TextLink>
      </Box>
    </Box>
  )
}
