import { CopyIcon, PlayIcon, TrashIcon } from '@urbiport/icons'
import { ButtonGroup, IconButton, SlideFade } from '@chakra-ui/react'

type Props = {
  onPlayClick: () => void
  isVisible: boolean
  position?: {
    top?: string
    right?: string
    left?: string
  }
}

export const GroupActionsBar = ({
  onPlayClick,
  isVisible,
  position = { top: '-50px', right: '0' }
}: Props) => {
  const dispatchCopyEvent = () => {
    dispatchEvent(new KeyboardEvent('keydown', { key: 'c', metaKey: true }))
  }

  const dispatchDeleteEvent = () => {
    dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }))
  }

  return (
    <SlideFade
      in={isVisible}
      style={{
        position: 'absolute',
        top: position.top,
        right: position.right,
        left: position.left,
      }}
      unmountOnExit
    >
      <ButtonGroup
        isAttached={true}
        variant="outline"
        size="sm"
        bg="bg.dark"
        borderRadius="md"
        borderWidth="1px"
        shadow="md"
      >
        <IconButton
          icon={<PlayIcon />}
          borderRightWidth="1px"
          borderRightRadius="none"
          aria-label={'Preview bot from this group'}
          variant="ghost"
          onClick={onPlayClick}
        />
        <IconButton
          icon={<CopyIcon />}
          borderRightWidth="1px"
          borderRightRadius="none"
          borderLeftRadius="none"
          aria-label={'Copy group'}
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation()
            dispatchCopyEvent()
          }}
        />
        <IconButton
          aria-label="Delete"
          borderLeftRadius="none"
          icon={<TrashIcon />}
          onClick={dispatchDeleteEvent}
          variant="ghost"
        />
      </ButtonGroup>
    </SlideFade>
  )
}
