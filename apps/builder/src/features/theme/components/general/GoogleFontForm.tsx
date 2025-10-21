import { Select } from '@urbiport/ui'
import { env } from '@quickbot.io/env'
import { GoogleFont } from '@quickbot.io/schemas'
import { defaultFontFamily } from '@quickbot.io/schemas/features/bot/theme/constants'
import { useState, useEffect, useCallback } from 'react'

const GOOGLE_FONTS_API_URL = `https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity`

const fetchPopularFonts = async (): Promise<string[]> => {
  if (!env.NEXT_PUBLIC_GOOGLE_API_KEY) {
    console.error('Google API Key is missing.')
    return []
  }

  try {
    const response = await fetch(`${GOOGLE_FONTS_API_URL}&key=${env.NEXT_PUBLIC_GOOGLE_API_KEY}`)

    if (!response.ok) {
      console.error(`Failed to fetch Google Fonts. Status: ${response.status}`)
      return []
    }

    const data = await response.json()
    return data.items.map((item: { family: string }) => item.family)
  } catch (error) {
    console.error('Error fetching Google Fonts:', error)
    return []
  }
}

type Props = {
  font: GoogleFont | string | undefined
  onFontChange: (font: GoogleFont) => void
}

export const GoogleFontForm = ({ font, onFontChange }: Props) => {
  const [currentFont, setCurrentFont] = useState<string>(
    (typeof font === 'string' ? font : font?.family) ?? defaultFontFamily,
  )
  const [googleFonts, setGoogleFonts] = useState<string[]>([])

  useEffect(() => {
    const fetchFonts = async () => {
      const fonts = await fetchPopularFonts()
      setGoogleFonts(fonts)
    }
    fetchFonts()
  }, [])

  const handleFontSelected = useCallback(
    (nextFont: string | undefined) => {
      if (!nextFont || nextFont === currentFont) return
      setCurrentFont(nextFont)
      onFontChange({ type: 'Google', family: nextFont })
    },
    [currentFont, onFontChange],
  )

  return (
    <Select
      placeholder="Search..."
      defaultValue={'Roboto'}
      selectedItem={currentFont}
      items={googleFonts}
      onSelect={handleFontSelected}
    />
  )
}
