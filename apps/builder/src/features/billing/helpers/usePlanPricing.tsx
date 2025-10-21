import { useColorModeValue } from '@chakra-ui/react'

const getLabel = (isCurrent: boolean, isDowngrade: boolean) => {
  if (isCurrent) return 'Actual Plan'
  if (isDowngrade) return 'Downgrade Plan'
  return 'Upgrade Plan'
}

export const usePlanPricing = (isCurrent: boolean, isDowngrade: boolean, isPopular: boolean) => {
  const colorTextGray = useColorModeValue('gray.300', 'gray.600')
  const colorTextWhite = useColorModeValue('gray.50', 'white')

  const label = getLabel(isCurrent, isDowngrade)

  // Utility functions for dynamic styling based on plan type
  const getTextColor = (isHighlight: boolean = false) => {
    if (isPopular) {
      return isHighlight ? colorTextWhite : colorTextGray
    }
    return isHighlight ? 'text.normal' : 'text.light'
  }

  return {
    colorTextGray,
    colorTextWhite,
    label,
    getTextColor,
  }
}