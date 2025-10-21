import { Button } from '@chakra-ui/react'
import { ChevronLeftIcon } from '@urbiport/icons'
import { useBotDnd } from '../BotDndProvider'
import Link from 'next/link'
import React, { useMemo } from 'react'
import { useTranslate } from '@tolgee/react'

export const BackButton = ({ id }: { id: string | null }) => {
  const { t } = useTranslate()
  const { draggedBot, setMouseOverFolderId, mouseOverFolderId } = useBotDnd()

  const isBotOver = useMemo(
    () => draggedBot && mouseOverFolderId === id,
    [draggedBot, id, mouseOverFolderId],
  )

  const handleMouseEnter = () => setMouseOverFolderId(id)
  const handleMouseLeave = () => setMouseOverFolderId(undefined)
  return (
    <Button
      as={Link}
      href={id ? `/bots/folders/${id}` : '/bots'}
      leftIcon={<ChevronLeftIcon />}
      variant={'outline:primary'}
      colorScheme={isBotOver || draggedBot ? 'blue' : 'gray'}
      borderWidth={isBotOver ? '2px' : '1px'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {t('back')}
    </Button>
  )
}
