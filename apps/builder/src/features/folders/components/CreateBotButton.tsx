import { Button, ButtonProps } from '@chakra-ui/react'
import { PlusIcon } from '@urbiport/icons'
import { useRouter } from 'next/router'
import { stringify } from 'qs'
import React from 'react'
import { useTranslate } from '@tolgee/react'
import { useBotDnd } from '../BotDndProvider'

export const CreateBotButton = ({ folderId, ...props }: { folderId?: string } & ButtonProps) => {
  const { t } = useTranslate()
  const router = useRouter()
  const { draggedBot } = useBotDnd()

  const handleClick = () =>
    router.push(
      `/bots/create?${stringify({
        folderId,
      })}`,
    )

  return (
    <Button
      style={{ width: '225px', height: '270px' }}
      onClick={handleClick}
      paddingX={6}
      whiteSpace={'normal'}
      colorScheme="blue"
      opacity={draggedBot ? 0.3 : 1}
      leftIcon={<PlusIcon size="md" />}
      {...props}
    >
      {t('folders.createBotButton.label')}
    </Button>
  )
}
