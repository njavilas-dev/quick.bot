import { HORIZONTAL_MENU_HEIGHT } from '@/features/editor/constants'
import { groupWidth } from '../constants'
import { Coordinates } from '../types'

export const projectMouse = (
  mouseCoordinates: Coordinates,
  graphPosition: Coordinates & { scale: number },
) => {
  return {
    x:
      (mouseCoordinates.x - graphPosition.x - groupWidth / (3 / graphPosition.scale)) /
      graphPosition.scale,
    y:
      (mouseCoordinates.y - graphPosition.y - (HORIZONTAL_MENU_HEIGHT + 20 * graphPosition.scale)) /
      graphPosition.scale,
  }
}
