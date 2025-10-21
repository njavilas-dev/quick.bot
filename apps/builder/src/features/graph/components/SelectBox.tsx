import { Box } from '@chakra-ui/react'
import { memo } from 'react'
import { Coordinates } from '../types'
import { HORIZONTAL_MENU_HEIGHT } from '@/features/editor/constants'

type Props = {
  origin: Coordinates
  dimension: {
    width: number
    height: number
  }
}

const SelectBoxComponent = ({ origin, dimension }: Props) => (
  <Box
    pos="absolute"
    borderRadius="md"
    borderWidth={1}
    borderColor="blue.200"
    bgColor="rgba(0, 66, 218, 0.1)"
    style={{
      left: origin.x - HORIZONTAL_MENU_HEIGHT,
      top: origin.y,
      width: dimension.width,
      height: dimension.height,
      zIndex: 1000,
      pointerEvents: 'none',
      willChange: 'transform',
    }}
  />
)

SelectBoxComponent.displayName = 'SelectBox'

export const SelectBox = memo(SelectBoxComponent)
