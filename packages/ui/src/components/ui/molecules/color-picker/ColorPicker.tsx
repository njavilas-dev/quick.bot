import React from 'react'
import Sketch, { SketchProps } from '@uiw/react-color-sketch'
import { ColorResult, rgbaToHex } from '@uiw/color-convert'
import { useOnChangeDebounced } from '../../../../hooks'

// Helper functions for color handling
const detectColorFormat = (color: string): 'hex' | 'rgba' | 'rgb' | 'unknown' => {
  if (!color) return 'unknown'
  if (color.startsWith('#')) return 'hex'
  if (color.startsWith('rgba')) return 'rgba'
  if (color.startsWith('rgb')) return 'rgb'
  return 'unknown'
}

const rgbaToString = (rgba: { r: number; g: number; b: number; a: number }): string => {
  return `rgba(${Math.round(rgba.r)}, ${Math.round(rgba.g)}, ${Math.round(rgba.b)}, ${rgba.a})`
}

const formatColorOutput = (
  colorResult: ColorResult,
  outputFormat: 'hex' | 'rgba' | 'auto',
  originalFormat?: string,
): string => {
  const { rgba } = colorResult

  switch (outputFormat) {
    case 'hex':
      return rgbaToHex(rgba)
    case 'rgba':
      return rgbaToString(rgba)
    case 'auto':
      if (rgba.a !== 1) return rgbaToString(rgba)
      if (originalFormat && detectColorFormat(originalFormat) === 'rgba') {
        return rgbaToString(rgba)
      }
      return rgbaToHex(rgba)
    default:
      return rgbaToHex(rgba)
  }
}

type ColorPickerProps = {
  color?: string
  setColor: (color: string) => void
  sketchProps?: SketchProps
  outputFormat?: 'hex' | 'rgba' | 'auto'
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  setColor,
  sketchProps,
  outputFormat = 'hex',
}) => {
  const originalFormat = color ? detectColorFormat(color) : 'hex'

  const { onChange } = useOnChangeDebounced<ColorResult>({
    debounceTimeout: 200,
    onChange: (colorResult: ColorResult) => {
      const formattedColor = formatColorOutput(colorResult, outputFormat, originalFormat)
      setColor(formattedColor)
    },
  })

  return (
    <Sketch
      {...(sketchProps ?? {})}
      style={{
        width: '100%',
        height: '100%',
        margin: '0px',
        padding: '0px',
        boxShadow: 'none',
      }}
      color={color}
      onChange={onChange}
      disableAlpha={false}
    />
  )
}
