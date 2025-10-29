import { GetServerSidePropsContext } from 'next'
import Link from 'next/link'
import React, { useState, type ReactNode, useEffect } from 'react'
import { AccountLayout } from '@/components/layouts/AccountLayout'
import type { NextPageWithLayout } from '@/pages/_app'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Stack,
  Text,
  AlertIcon,
  Tag,
  MenuItem,
  MenuDivider,
  IconButton,
  Spinner,
} from '@chakra-ui/react'
import { Alert, BoxCard, H2, DropdownMenu, Switch } from '@urbiport/ui'
import {
  CopyIcon,
  TrashIcon,
  MoreVerticalIcon,
  DragIcon,
  BarChartIcon,
  ShareIcon,
  ToolIcon,
  ColorBrushIcon,
  FilterIcon,
  EmailIcon,
} from '@urbiport/icons'
import { useBots } from '@/hooks/useBots'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useToast } from '@urbiport/ui'
import { BotCreateButtons } from '@/features/templates/components/BotCreateButtons'
import { ConfirmModal } from '@/components/ConfirmModal'
import { T, useTranslate } from '@tolgee/react'
import { trpc, trpcVanilla } from '@/lib/trpc'
import { isMobile } from '@/helpers/isMobile'
import { useRouter } from 'next/router'
import { duplicateName } from '@/features/bot/helpers/duplicateName'
import { BotInDashboard } from '@/features/bot/types'
import { BotIcon } from '@/components/BotIcon'
import { BotListFilters } from '@/features/templates/components/BotListFilters'
import { TableSkeleton } from '@/components/TableSkeleton'

type BotInstructionSte = {
  label: string
  description: string
}

export const botInstructionSteps: BotInstructionSte[] = [
  {
    label: 'Flow',
    description: `Create bot flow`,
  },
  {
    label: 'Settings',
    description: `Define chat settings`,
  },
  {
    label: 'Theme',
    description: `Define chat style`,
  },
  {
    label: 'Deploy',
    description: `Deploy bot options`,
  },
] as const

const Page: NextPageWithLayout = () => {
  const { t } = useTranslate()
  const { workspace } = useWorkspace()
  const [deletingBot, setDeletingBot] = useState<BotInDashboard | null>(null)
  const [deletingBotId, setDeletingBotId] = useState<string | null>(null)
  const { showToast } = useToast()
  const router = useRouter()
  const {
    bots,
    isLoading: isBotsLoading,
    refetch: refetchBots,
  } = useBots({
    workspaceId: workspace?.id ?? '',
    folderId: 'root',
    onError: (error) => {
      showToast({
        detailsTitle: t('toast.details'),
        description: error.message,
      })
    },
  })

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [botsLimitExceded, setBotsLimitExceded] = useState(false)

  const botsLimit = workspace?.billingPlan?.botsLimit || 1
  const botsQuantiy = bots?.length || 0

  const allowResults = workspace?.billingPlan?.allowResults || false

  const handleSearchChange = (value: string) => setSearch(value)
  const handleStatusChange = (value: string) => setStatus(value)
  const handleClearFilters = () => {
    setSearch('')
    setStatus('')
  }

  const filteredBots = bots?.filter((bot) => {
    const matchesSearch = bot.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      status === '' ||
      (status === 'live' && bot.publishedBotId) ||
      (status === 'draft' && !bot.publishedBotId)
    return matchesSearch && matchesStatus
  })

  const { mutate: importBot } = trpc.bot.importBot.useMutation({
    onError: (error) => {
      showToast({
        detailsTitle: t('toast.details'),
        description: error.message,
      })
    },
    onSuccess: ({ bot }) => {
      router.push(`/bots/${bot.id}/flow`)
    },
  })

  const { mutate: deleteBot } = trpc.bot.deleteBot.useMutation({
    onError: (error) => {
      setDeletingBotId(null)
      showToast({
        detailsTitle: t('toast.details'),
        description: error.message,
      })
    },
    onSuccess: () => {
      refetchBots()
      setDeletingBotId(null)
    },
  })

  const { mutate: unpublishBot } = trpc.bot.unpublishBot.useMutation({
    onError: (error) => {
      showToast({
        detailsTitle: t('toast.details'),
        description: error.message,
      })
    },
    onSuccess: () => {
      refetchBots()
    },
  })

  const { mutate: publishBotMutate } = trpc.bot.publishBot.useMutation({
    onError: (error) => {
      showToast({
        detailsTitle: t('toast.details'),
        description: error.message,
      })
    },
    onSuccess: () => {
      refetchBots()
    },
  })

  const handleClick = (botId: string, step: string) => {
    router.push(isMobile ? `/analytics/${botId}/answers` : `/bots/${botId}/${step}`)
  }

  const handleDuplicateClick = async (id: string) => {
    const { bot: botToDuplicate } = await trpcVanilla.bot.getBot.query({
      botId: id,
    })
    if (!botToDuplicate) return
    importBot({
      workspaceId: botToDuplicate.workspaceId,
      bot: {
        ...botToDuplicate,
        name: duplicateName(botToDuplicate.name),
      },
    })
  }

  const handleUnpublishClick = async (id: string) => {
    unpublishBot({ botId: id })
  }

  const handlePublishClick = async (id: string) => {
    publishBotMutate({ botId: id })
  }

  const handleDeleteClick = (id: string) => {
    const bot = bots!.find(({ id: botId }) => botId === id)
    setDeletingBot(bot || null)
  }

  const handleDeleteModalClick = async () => {
    const botId = deletingBot!.id
    setDeletingBotId(botId)
    deleteBot({
      botId: botId,
    })
    setDeletingBot(null)
  }

  const handleOnPublishChange = (bot: BotInDashboard) => (isChecked: boolean) => {
    if (!isChecked) {
      handleUnpublishClick(bot.id)
    } else {
      handlePublishClick(bot.id)
    }
  }
  const isLoading = isBotsLoading || !filteredBots || !workspace

  useEffect(() => {
    if (botsQuantiy >= botsLimit) {
      setBotsLimitExceded(true)
    } else {
      setBotsLimitExceded(false)
    }
  }, [botsQuantiy, botsLimit])

  return (
    <BoxCard>
      <Stack spacing={4}>
        <H2>{bots?.length} Bots</H2>
        <Stack direction="row" justifyContent="space-between">
          <BotListFilters
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
            onClearFilters={handleClearFilters}
          />
          <BotCreateButtons botsLimitExceded={botsLimitExceded} />
        </Stack>
        <Stack spacing={2} overflowX="auto" px={'5px'}>
          <Table variant="card">
            <Thead>
              <Tr>
                <Th>#</Th>
                <Th>{t('Avatar')}</Th>
                <Th>{t('Name')}</Th>
                <Th>{t('Views')}</Th>
                <Th>{t('Starts')}</Th>
                <Th>{t('Completed')}</Th>
                <Th>{t('Status')}</Th>
                <Th>{t('Publish')}</Th>
                <Th>{t('Actions')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredBots?.map((bot) => {
                const isDeleting = deletingBotId === bot.id
                return (
                  <Tr key={bot.id} opacity={isDeleting ? 0.7 : 1}>
                    <Td>
                      {isDeleting ? (
                        <Spinner size="sm" color="brand.primary" />
                      ) : (
                        <DragIcon color="text.light" />
                      )}
                    </Td>
                    <Td>
                      <BotIcon icon={bot.icon} name={bot.name} />
                    </Td>
                    <Td>
                      <Link href={`/bots/${bot.id}/flow`}>{bot.name}</Link>
                    </Td>
                    <Td>{bot.totalViews}</Td>
                    <Td>{bot.totalStarts}</Td>
                    <Td>{bot.totalCompleted}</Td>
                    <Td>
                      <Tag colorScheme={bot.publishedBotId ? 'green' : 'gray'}>
                        {bot.publishedBotId ? t('folders.botButton.live') : 'Draft'}
                      </Tag>
                    </Td>
                    <Td>
                      <Switch
                        defaultValue={!!bot.publishedBotId}
                        onChange={handleOnPublishChange(bot)}
                        isDisabled={isDeleting}
                      />
                    </Td>
                    <Td>
                      {isDeleting ? (
                        <Spinner size="sm" color="brand.primary" />
                      ) : (
                        <DropdownMenu
                          placement="bottom-end"
                          matchWidth={false}
                          menuButtonProps={{
                            as: IconButton,
                            variant: 'ghost',
                            icon: <MoreVerticalIcon color="text.light" size="sm" />,
                            size: 'sm',
                            name: 'actions',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <MenuItem
                            onClick={() => handleClick(bot.id, 'flow')}
                            icon={<FilterIcon color="text.light" />}
                            name="edit"
                          >
                            Flow
                          </MenuItem>
                          <MenuItem
                            onClick={() => handleClick(bot.id, 'settings')}
                            icon={<ToolIcon color="text.light" />}
                          >
                            Settings
                          </MenuItem>
                          <MenuItem
                            onClick={() => handleClick(bot.id, 'theme')}
                            icon={<ColorBrushIcon color="text.light" />}
                            name="edit"
                          >
                            Theme
                          </MenuItem>
                          <MenuItem
                            onClick={() => handleClick(bot.id, 'deploy')}
                            icon={<ShareIcon color="text.light" />}
                          >
                            Deploy
                          </MenuItem>
                          <MenuItem
                            onClick={() => router.push(`/inbox/${bot.id}`)}
                            icon={<EmailIcon color="text.light" />}
                          >
                            Inbox
                          </MenuItem>
                          <MenuItem
                            isDisabled={!allowResults}
                            onClick={() => router.push(`/analytics/${bot.id}`)}
                            icon={<BarChartIcon color="text.light" />}
                          >
                            Analytics
                          </MenuItem>
                          <MenuDivider />
                          <MenuItem
                            isDisabled={botsLimitExceded}
                            onClick={() => handleDuplicateClick(bot.id)}
                            icon={<CopyIcon color="text.light" />}
                            name="duplicate"
                          >
                            {t('folders.botButton.duplicate')}
                          </MenuItem>
                          <MenuItem
                            onClick={() => handleDeleteClick(bot.id)}
                            icon={<TrashIcon color="text.light" />}
                            name="delete"
                          >
                            {t('folders.botButton.delete')}
                          </MenuItem>
                        </DropdownMenu>
                      )}
                    </Td>
                  </Tr>
                )
              })}
              {isLoading && <TableSkeleton columns={9} />}
            </Tbody>
          </Table>
          <ConfirmModal
            message={
              <Stack spacing="4">
                <Text>
                  <T
                    keyName="folders.botButton.deleteConfirmationMessage"
                    params={{
                      strong: <strong>{deletingBot?.name}</strong>,
                    }}
                  />
                </Text>
                <Alert status="warning">
                  <AlertIcon color="text.light" />
                  {t('folders.botButton.deleteConfirmationMessageWarning')}
                </Alert>
              </Stack>
            }
            confirmButtonLabel={t('delete')}
            onConfirm={handleDeleteModalClick}
            isOpen={!!deletingBot}
            onClose={() => setDeletingBot(null)}
            onReject={() => setDeletingBot(null)}
          />
        </Stack>
      </Stack>
    </BoxCard>
  )
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <AccountLayout>{page}</AccountLayout>
}

export default Page

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const callbackUrl = context.query.callbackUrl?.toString()
  const redirectPath =
    context.query.redirectPath?.toString() ??
    (callbackUrl ? new URL(callbackUrl).searchParams.get('redirectPath') : undefined)
  return redirectPath
    ? {
      redirect: {
        permanent: false,
        destination: redirectPath,
      },
    }
    : { props: {} }
}
