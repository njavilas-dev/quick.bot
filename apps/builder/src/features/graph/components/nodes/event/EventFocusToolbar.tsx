import { PlayIcon, TrashIcon } from '@urbiport/icons'
import { HStack, IconButton } from '@chakra-ui/react'

type Props = {
  onPlayClick: () => void
  onDeleteClick?: () => void
}

export const EventFocusToolbar = ({ onPlayClick, onDeleteClick }: Props) => {
  return (
    <HStack borderRadius="md" spacing={0} borderWidth="1px" bgColor="bg.dark" shadow="md">
      <IconButton
        icon={<PlayIcon />}
        borderRightWidth="1px"
        borderRightRadius="none"
        aria-label={'Preview bot from this group'}
        variant="ghost"
        onClick={onPlayClick}
        size="sm"
      />
      {onDeleteClick ? (
        <IconButton
          aria-label="Delete"
          borderLeftRadius="none"
          borderRightRadius="md"
          icon={<TrashIcon />}
          onClick={onDeleteClick}
          variant="ghost"
          size="sm"
        />
      ) : null}
    </HStack>
  )
}
