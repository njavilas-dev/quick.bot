import { Button, useDisclosure, HStack } from '@chakra-ui/react'
import { ToolIcon, TemplateIcon, DownloadIcon } from '@urbiport/icons'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { BotButtonImport } from './BotButtonImport'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useUser } from '@/hooks/useUser'
import { useToast } from '@urbiport/ui'
import { trpc } from '@/lib/trpc'
import { useTranslate } from '@tolgee/react'
import { Bot } from '@quickbot.io/schemas'
import { TemplatesModal } from './TemplatesModal'

export const BotCreateButtons = ({ botsLimitExceded = true }: { botsLimitExceded?: boolean }) => {
  const { t } = useTranslate()
  const { workspace } = useWorkspace()
  const { user } = useUser()
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [isLoading, setIsLoading] = useState(false)

  const { showToast } = useToast()

  const { mutate: createBot } = trpc.bot.createBot.useMutation({
    onMutate: () => {
      setIsLoading(true)
    },
    onError: (error) => {
      showToast({
        detailsTitle: t('toast.details'),
        title: 'Failed to create bot',
        description: error.message,
      })
    },
    onSuccess: (data) => {
      router.push({
        pathname: `/bots/${data.bot.id}/flow`,
      })
    },
    onSettled: () => {
      setIsLoading(false)
    },
  })

  const { mutate: importBot } = trpc.bot.importBot.useMutation({
    onMutate: () => {
      setIsLoading(true)
    },
    onError: (error) => {
      showToast({
        detailsTitle: t('toast.details'),
        title: 'Failed to import bot',
        description: error.message,
      })
    },
    onSuccess: (data) => {
      router.push({
        pathname: `/bots/${data.bot.id}/flow`,
      })
    },
    onSettled: () => {
      setIsLoading(false)
    },
  })

  const handleCreateSubmit = async (bot?: Bot) => {
    if (!user || !workspace) return
    const folderId = router.query.folderId?.toString() ?? null
    if (bot)
      importBot({
        workspaceId: workspace.id,
        bot: {
          ...bot,
          folderId,
        },
      })
    else
      createBot({
        workspaceId: workspace.id,
        bot: {
          name: t('bots.defaultName'),
          folderId,
        },
      })
  }

  return (
    <HStack direction={'row'} spacing={2}>
      <BotButtonImport
        isDisabled={botsLimitExceded}
        variant="outline:primary"
        leftIcon={<DownloadIcon />}
        isLoading={isLoading}
        onImportBot={handleCreateSubmit}
      >
        Import
      </BotButtonImport>
      <Button
        isDisabled={botsLimitExceded}
        variant="outline:primary"
        leftIcon={<TemplateIcon />}
        onClick={onOpen}
        isLoading={isLoading}
      >
        Template
      </Button>
      <Button isDisabled={botsLimitExceded} leftIcon={<ToolIcon />} onClick={() => handleCreateSubmit()} isLoading={isLoading}>
        Create
      </Button>
      <TemplatesModal
        isOpen={isOpen}
        onClose={onClose}
        onBotChoose={handleCreateSubmit}
        isLoading={isLoading}
      />
    </HStack>
  )
}
