import { CloseIcon, VideoPopoverIcon } from '@urbiport/icons'
import {
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  IconButton,
  Popover,
  PopoverTrigger,
  IconButtonProps,
} from '@chakra-ui/react'
import { useOnboardingDisclosure } from '../hooks/useOnboardingDisclosure'
import { onboardingVideos } from '../data'
import { useUser } from '@/hooks/useUser'
import { ForgedBlockDefinition } from '@quickbot.io/forge-repository/types'
import { YoutubeIframe } from './YoutubeIframe'

type Props = {
  type: keyof typeof onboardingVideos
  defaultIsOpen?: boolean
  blockDef?: ForgedBlockDefinition
  children: ({ onToggle }: { onToggle: () => void }) => JSX.Element
}

const Root = ({ type, blockDef, children }: Props) => {
  const { user, updateUser } = useUser()
  const youtubeId = onboardingVideos[type]?.youtubeId ?? blockDef?.onboarding?.youtubeId
  const { isOpen, onClose, onToggle } = useOnboardingDisclosure({
    key: type,
    updateUser,
    user,
    blockDef,
  })

  if (!youtubeId) return children({ onToggle })

  return (
    <Popover isLazy isOpen={isOpen} placement="right">
      <PopoverTrigger>{children({ onToggle })}</PopoverTrigger>
      <PopoverContent aspectRatio="1.5" width="640px">
        <PopoverArrow />
        <PopoverBody h="full" p="5">
          <YoutubeIframe id={youtubeId} />
          <IconButton
            icon={<CloseIcon />}
            aria-label={'Close'}
            pos="absolute"
            top="-3"
            right="-3"
            variant={'round:brand.primary'}
            size="sm"
            onClick={onClose}
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

const TriggerIconButton = (props: Omit<IconButtonProps, 'aria-label'>) => (
  <IconButton
    size="sm"
    icon={<VideoPopoverIcon />}
    aria-label={'Open Agent components help video'}
    variant="ghost"
    colorScheme="blue"
    {...props}
  />
)

export const VideoOnboardingPopover = {
  Root,
  TriggerIconButton,
}
