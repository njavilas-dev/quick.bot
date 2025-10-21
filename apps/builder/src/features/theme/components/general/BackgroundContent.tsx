import { ImageUploadContent } from '@/components/ImageUploadContent'
import { useBot } from '@/features/editor/providers/BotProvider'
import {
  Flex,
  Popover,
  PopoverContent,
  Image,
  Button,
  Portal,
  PopoverAnchor,
  useDisclosure,
} from '@chakra-ui/react'
import { isNotEmpty } from '@quickbot.io/lib'
import { Background } from '@quickbot.io/schemas'
import React from 'react'
import {
  BackgroundType,
  defaultBackgroundColor,
  defaultBackgroundType,
} from '@quickbot.io/schemas/features/bot/theme/constants'
import { useTranslate } from '@tolgee/react'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { ColorPicker } from '@urbiport/ui'

type BackgroundContentProps = {
  background?: Background
  onBackgroundContentChange: (content: string) => void
}

export const BackgroundContent = ({
  background,
  onBackgroundContentChange,
}: BackgroundContentProps) => {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const { t } = useTranslate()
  const { bot } = useBot()
  const handleContentChange = (content: string) => onBackgroundContentChange(content)
  const popoverContainerRef = React.useRef<HTMLDivElement>(null)

  useOutsideClick({
    ref: popoverContainerRef,
    handler: onClose,
    isEnabled: isOpen,
  })

  if ((background?.type ?? defaultBackgroundType) === BackgroundType.IMAGE) {
    if (!bot) return null
    return (
      <Flex ref={popoverContainerRef}>
        <Popover isLazy isOpen={isOpen} placement="top">
          <PopoverAnchor>
            {isNotEmpty(background?.content) ? (
              <Image
                src={background?.content}
                alt={t('theme.sideMenu.global.background.image.alt')}
                onClick={onOpen}
                cursor="pointer"
                _hover={{ filter: 'brightness(.9)' }}
                transition="filter 200ms"
                borderRadius="md"
                w="full"
                maxH="200px"
                objectFit="cover"
              />
            ) : (
              <Button onClick={onOpen} w="full">
                {t('theme.sideMenu.global.background.image.button')}
              </Button>
            )}
          </PopoverAnchor>
          <Portal>
            <PopoverContent
              p="4"
              w="500px"
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <ImageUploadContent
                uploadFileProps={{
                  workspaceId: bot.workspaceId,
                  botId: bot.id,
                  fileName: 'background',
                }}
                defaultValue={background?.content}
                onChange={handleContentChange}
              />
            </PopoverContent>
          </Portal>
        </Popover>
      </Flex>
    )
  }
  if ((background?.type ?? defaultBackgroundType) === BackgroundType.COLOR) {
    return (
      <Flex justify="space-between" align="center">
        <ColorPicker
          color={background?.content ?? defaultBackgroundColor}
          setColor={handleContentChange}
        />
      </Flex>
    )
  }
  return null
}
