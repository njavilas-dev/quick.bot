export const hexToRgb = (hex: string): [r: number, g: number, b: number] => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  hex = hex.replace(shorthandRegex, (_m, r, g, b) => {
    return r + r + g + g + b + b
  })

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0]
}

// Universal color converter that handles both hex and rgba formats
export const colorToRgb = (color: string): [r: number, g: number, b: number] => {
  if (!color) return [0, 0, 0]

  // Handle hex colors
  if (color.startsWith('#')) {
    return hexToRgb(color)
  }

  // Handle rgba/rgb colors
  if (color.startsWith('rgba') || color.startsWith('rgb')) {
    const match = color.match(/\d+(\.\d+)?/g)
    if (match && match.length >= 3) {
      return [parseInt(match[0], 10), parseInt(match[1], 10), parseInt(match[2], 10)]
    }
  }

  // Fallback to hexToRgb for other formats
  return hexToRgb(color)
}

// Extract alpha value from rgba color string
export const extractAlpha = (color: string): number => {
  if (!color) return 1

  // Handle rgba colors
  if (color.startsWith('rgba')) {
    const match = color.match(/\d+(\.\d+)?/g)
    if (match && match.length >= 4) {
      return parseFloat(match[3])
    }
  }

  // Default alpha for hex and rgb colors
  return 1
}

// Parse color string to get both RGB and alpha
export const parseColorWithAlpha = (
  color: string,
): { rgb: [number, number, number]; alpha: number } => {
  return {
    rgb: colorToRgb(color),
    alpha: extractAlpha(color),
  }
}
