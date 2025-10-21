import React, { useState } from 'react'
import { Box, Text } from '@chakra-ui/react'
import { GiphyFetch } from '@giphy/js-fetch-api'
import { Grid } from '@giphy/react-components'
import { useTranslate } from '@tolgee/react'
import { env } from '@quickbot.io/env'
import { GiphyLogo } from '@urbiport/icons'
import { InputTextWithVariables } from '../inputs'
import { FormControl } from '@urbiport/ui'

type Props = {
  onChange: (url: string) => void
}

const giphyFetch = new GiphyFetch(env.NEXT_PUBLIC_GIPHY_API_KEY ?? '')

export const GiphyPicker = ({ onChange }: Props) => {
  const { t } = useTranslate()

  const [inputValue, setInputValue] = useState('')

  const fetchGifs = (offset: number) => giphyFetch.search(inputValue, { offset, limit: 10 })

  const fetchGifsTrending = (offset: number) => giphyFetch.trending({ offset, limit: 10 })

  if (!env.NEXT_PUBLIC_GIPHY_API_KEY) {
    return <Text>NEXT_PUBLIC_GIPHY_API_KEY is missing in environment</Text>
  }

  return (
    <>
      <FormControl pt={4}>
        <InputTextWithVariables
          autoFocus
          placeholder={t('giphyPicker.searchInput.placeholder')}
          onChange={setInputValue}
          rightIcon={<GiphyLogo ml="-50px" width="60px" />}
        />
      </FormControl>
      <Box overflowY="auto" maxH="35vh">
        <Grid
          key={inputValue}
          onGifClick={(gif, e) => {
            e.preventDefault()
            onChange(gif.images.downsized.url)
          }}
          fetchGifs={inputValue === '' ? fetchGifsTrending : fetchGifs}
          width={475}
          columns={3}
          className="my-4"
        />
      </Box>
    </>
  )
}
