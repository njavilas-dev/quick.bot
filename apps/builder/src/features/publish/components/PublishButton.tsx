import assert from 'assert'
import React, { useState } from 'react'
import {
  Button,
  ButtonGroup,
  IconButton,
  Stack,
  Tooltip,
  Text,
  MenuItem,
  useDisclosure,
  ButtonProps,
  MenuDivider,
} from '@chakra-ui/react'
import {
  BarChartIcon,
  BookIcon,
  BuoyIcon,
  ChevronDownIcon,
  CloudOffIcon,
  DownloadIcon,
  EyeOnIcon,
  LockedIcon,
  UndoIcon,
  UnlockedIcon,
} from '@urbiport/icons'
import { useBot } from '@/features/editor/providers/BotProvider'
import { useWorkspace } from '@/hooks/useWorkspace'
import { T, useTranslate } from '@tolgee/react'
import { trpc } from '@/lib/trpc'
import { DropdownMenu, useToast } from '@urbiport/ui'
import { parseDefaultPublicId } from '../helpers/parseDefaultPublicId'
import { env } from '@quickbot.io/env'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { ConfirmModal } from '@/components/ConfirmModal'
import { TextLink } from '@/components/TextLink'
import { useTimeSince } from '@/hooks/useTimeSince'
import UpgradePlan from '@/features/billing/components/UpgradePlan'
import { BillingPlanType } from '@quickbot.io/prisma'
import { useRouter } from 'next/router'

type Props = ButtonProps & {
  isMoreMenuDisabled?: boolean
}

export const PublishButton = ({
  isMoreMenuDisabled = false,
  ...props
}: Props) => {

  const router = useRouter()

  const isIframe = router.asPath.endsWith('/iframe')

  const { t } = useTranslate()
  const { workspace } = useWorkspace()
  const {
    isOpen: isOpenUpgradePlan,
    onClose: onCloseUpgradePlan,
    onOpen: onOpenUpgradePlan,
  } = useDisclosure()
  const {
    isOpen: isNewEngineWarningOpen,
    onOpen: onNewEngineWarningOpen,
    onClose: onNewEngineWarningClose,
  } = useDisclosure()
  const {
    isOpen: isPublishConfirmOpen,
    onOpen: onPublishConfirmOpen,
    onClose: onPublishConfirmClose,
  } = useDisclosure()
  const {
    currentUserMode,
    isPublished,
    isModified,
    publishedBot,
    restorePublishedBot,
    bot,
    isSavingLoading,
    updateBot,
    save,
    publishedBotVersion,
    refetchBot,
  } = useBot()

  const [isDownloading, setIsDownloading] = useState(false)
  const timeSinceLastPublish = useTimeSince(publishedBot?.updatedAt.toString())
  const { showToast } = useToast()

  const isNewVersion = publishedBot && publishedBotVersion !== bot?.version

  const hasInputFile = bot?.groups
    .flatMap((g) => g.blocks)
    .some((b) => b.type === InputBlockType.FILE)

  const hasUnsuportedFileInput = !workspace?.billingPlan?.allowCustomDomain && hasInputFile

  const {
    bot: {
      getPublishedBot: { refetch: refetchPublishedBot },
    },
  } = trpc.useContext()

  const { mutate: publishBotMutate, isLoading: isPublishing } = trpc.bot.publishBot.useMutation({
    onError: (error) => {
      showToast({
        detailsTitle: t('toast.details'),
        title: t('publish.error.label'),
        description: error.message,
      })
      if (error.data?.httpStatus === 403) {
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      }
    },
    onSuccess: () => {
      if (bot?.id) {
        refetchPublishedBot({
          botId: bot.id,
        })
        // Refresh bot data to sync localBot timestamp with database
        refetchBot()
      }
    },
  })

  const { mutate: unpublishBotMutate, isLoading: isUnpublishing } =
    trpc.bot.unpublishBot.useMutation({
      onError: (error) => {
        showToast({
          detailsTitle: t('toast.details'),
          title: t('editor.header.unpublishBot.error.label'),
          description: error.message,
        })
      },
      onSuccess: () => {
        if (bot?.id) {
          refetchPublishedBot({
            botId: bot.id,
          })
        }
      },
    })

  const handleSaveClick = async () => {
    if (!bot?.id) return

    if (hasUnsuportedFileInput) {
      onOpenUpgradePlan()
      return
    }

    await save()
  }

  const handlePublishClick = async () => {
    if (!bot?.id) return
    if (isNewVersion) {
      onNewEngineWarningOpen()
      return
    }
    await handleSaveClick()
    publishBotMutate({
      botId: bot.id,
    })
    onPublishConfirmClose()
  }

  const handlePublishWithConfirmation = () => {
    onPublishConfirmOpen()
  }

  const unpublishBot = async () => {
    if (!bot?.id) return
    if (bot.isClosed) await updateBot({ updates: { isClosed: false }, save: true })
    unpublishBotMutate({
      botId: bot?.id,
    })
  }

  const closeBot = async () => {
    await updateBot({ updates: { isClosed: true }, save: true })
  }

  const openBot = async () => {
    await updateBot({ updates: { isClosed: false }, save: true })
  }

  const exportBot = () => {
    assert(bot)
    setIsDownloading(true)
    const generatedPublicId: string = bot
      ? bot.publicId ?? parseDefaultPublicId(bot.name, bot.id)
      : ''

    const data = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bot))
    const fileName = `quickbot-export-${generatedPublicId}.json`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', data)
    linkElement.setAttribute('download', fileName)
    linkElement.click()
    setIsDownloading(false)
  }

  const onHelpClick = () => {
    window.open('https://docs.quick.bot/support/contact', '_blank')
  }

  const redirectToDocumentation = () =>
    window.open('https://docs.quick.bot/builder/editor/flow', '_blank')

  return (
    <>
      <ButtonGroup isAttached>
        {isModified ? (
          <Tooltip
            placement="bottom-end"
            label={
              <Stack>
                <Text>{t('publishButton.tooltip.nonPublishedChanges.label')}</Text>
                {timeSinceLastPublish ? (
                  <Text fontStyle="italic">
                    <T
                      keyName="publishButton.tooltip.publishedVersion.from.label"
                      params={{
                        timeSince: timeSinceLastPublish,
                      }}
                    />
                  </Text>
                ) : null}
              </Stack>
            }
            isDisabled={!isModified}
          >
            <Button
              variant="solid"
              isLoading={isPublishing || isUnpublishing || isSavingLoading}
              isDisabled={!isModified || isSavingLoading || isDownloading}
              onClick={() => {
                handlePublishWithConfirmation()
              }}
              borderRightRadius={publishedBot && !isMoreMenuDisabled ? 0 : undefined}
              {...props}
            >
              {t('save')}
            </Button>
          </Tooltip>
        ) : (
          <Button
            variant="solid"
            isLoading={isPublishing || isUnpublishing || isSavingLoading}
            isDisabled={isPublished || isSavingLoading || isDownloading}
            onClick={() => {
              handlePublishWithConfirmation()
            }}
            borderRightRadius={publishedBot && !isMoreMenuDisabled ? 0 : undefined}
            {...props}
          >
            {isPublished
              ? bot?.isClosed
                ? t('publishButton.closed.label')
                : t('publishButton.published.label')
              : t('publishButton.label')}
          </Button>
        )}

        {!isMoreMenuDisabled && (
          <DropdownMenu
            placement="top-end"
            matchWidth={false}
            menuButtonProps={{
              bg: undefined,
              as: IconButton,
              variant: 'solid',
              justifyContent: 'center',
              borderLeftRadius: 0,
              icon: <ChevronDownIcon transform="rotate(180deg)" />,
              'aria-label': t('publishButton.dropdown.showMenu.label'),
              size: 'sm',
              isDisabled: isPublishing || isSavingLoading,
            }}
          >
            {isPublished && (
              <MenuItem onClick={unpublishBot} icon={<CloudOffIcon />}>
                {t('publishButton.dropdown.unpublish.label')}
              </MenuItem>
            )}
            {isPublished && isModified && (
              <MenuItem onClick={restorePublishedBot} icon={<UndoIcon />}>
                {t('publishButton.dropdown.restoreVersion.label')}
              </MenuItem>
            )}
            {isPublished && (
              <>
                {!bot?.isClosed ? (
                  <MenuItem onClick={closeBot} icon={<LockedIcon />}>
                    {t('publishButton.dropdown.close.label')}
                  </MenuItem>
                ) : (
                  <MenuItem onClick={openBot} icon={<UnlockedIcon />}>
                    {t('publishButton.dropdown.reopen.label')}
                  </MenuItem>
                )}
              </>
            )}
            {currentUserMode !== 'guest' && (
              <MenuItem icon={<DownloadIcon />} onClick={exportBot}>
                {t('editor.graph.menu.exportFlowItem.label')}
              </MenuItem>
            )}
            {!isIframe && bot?.id && (
              <>
                <MenuDivider />
                {isPublished && (
                  <MenuItem
                    icon={<EyeOnIcon />}
                    onClick={() => {
                      const publicId =
                        bot?.publicId ?? parseDefaultPublicId(bot?.name ?? '', bot?.id ?? '')
                      window.open(`${env.NEXT_PUBLIC_VIEWER_URL[0]}/${publicId}`, '_blank')
                    }}
                  >
                    Viewer
                  </MenuItem>
                )}
                <MenuItem
                  icon={<BarChartIcon />}
                  onClick={() => router.push(`/analytics/${bot.id}/answers`)}
                >
                  Analytics
                </MenuItem>
              </>
            )}
            {!isIframe &&
              <>
                <MenuDivider />
                <MenuItem icon={<BookIcon />} onClick={redirectToDocumentation}>
                  {t('editor.graph.menu.documentationItem.label')}
                </MenuItem>
                <MenuItem icon={<BuoyIcon />} onClick={onHelpClick}>
                  {t('editor.header.helpButton.label')}
                </MenuItem>
              </>
            }
          </DropdownMenu>
        )}
      </ButtonGroup>
      <UpgradePlan
        externalDisclosure={{ isOpen: isOpenUpgradePlan, onClose: onCloseUpgradePlan }}
        excludedPlans={[BillingPlanType.FREE]}
      />
      <ConfirmModal
        isOpen={isNewEngineWarningOpen}
        onConfirm={handlePublishClick}
        onClose={onNewEngineWarningClose}
        onReject={onNewEngineWarningClose}
        confirmButtonColor="blue"
        title={t('publish.versionWarning.title.label')}
        message={
          <Stack spacing="3">
            <Text>{t('publish.versionWarning.message.aboutToDeploy.label')}</Text>
            <Text fontWeight="bold">
              <T
                keyName="publish.versionWarning.checkBreakingChanges"
                params={{
                  link: (
                    <TextLink href="https://docs.quick.bot/breaking-changes#bot-v6" isExternal />
                  ),
                }}
              />
            </Text>
            <Text>{t('publish.versionWarning.message.testInPreviewMode.label')}</Text>
          </Stack>
        }
        confirmButtonLabel={t('publishButton.label')}
      />
      <ConfirmModal
        isOpen={isPublishConfirmOpen}
        onConfirm={handlePublishClick}
        onClose={onPublishConfirmClose}
        onReject={onPublishConfirmClose}
        confirmButtonColor="blue"
        title="Confirm Publish"
        message={
          <Stack spacing="3">
            <Text>Are you sure you want to publish these changes?</Text>
            <Text>Once published, these changes will be visible to all users of your bot.</Text>
          </Stack>
        }
        confirmButtonLabel="Yes"
      />
    </>
  )
}
