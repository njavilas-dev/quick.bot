import {
  Alert,
  AlertIcon,
  Button,
  IconButton,
  Input,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  OrderedList,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useClipboard,
  useDisclosure,
} from '@chakra-ui/react'
import { CopyIcon } from '@urbiport/icons'
import { useTranslate } from '@tolgee/react'
import { Switch, FormControl, Select, InputNumber, useToast, InputTextCopy } from '@urbiport/ui'
import { Comparison } from '@quickbot.io/schemas'
import { isDefined } from '@quickbot.io/lib'
import { LogicalOperator } from '@quickbot.io/schemas/features/blocks/logic/condition/constants'
import { useWorkspace } from '@/hooks/useWorkspace'
import { trpc } from '@/lib/trpc'
import { TextLink } from '@/components/TextLink'
import { TableList } from '@/components/TableList'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import { ForgedCredentialsDropdown } from '@/features/forge/components/credentials/ForgedCredentialsDropdown'
import { useBot } from '@/features/editor/providers/BotProvider'
import { ModalProps } from '@/features/publish/components/embeds/EmbedButton'
import { WhatsAppCredentialsModal } from './WhatsAppCredentialsModal'
import { WhatsAppComparisonItem } from './WhatsAppComparisonItem'
import React, { useState, useEffect } from 'react'
import { env } from '@quickbot.io/env'
import { PremiumAlert } from '@/components/PremiumAlert'
import { BillingPlanType } from '@quickbot.io/prisma'

const CopyButton = ({ json }: { json: string }) => {
  const { t } = useTranslate()
  const { onCopy } = useClipboard(json)
  const { showToast } = useToast()

  const handleCopy = () => {
    onCopy()
    showToast({ status: 'success', description: t('publish.whatsapp.flowTemplates.copied') })
  }

  return (
    <IconButton
      size="sm"
      variant="outline"
      icon={<CopyIcon />}
      aria-label={t('publish.whatsapp.flowTemplates.copy')}
      onClick={handleCopy}
    />
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FlowTemplatesTable = ({
  templates,
  updateFlowId,
  credentials,
}: {
  templates: { id: string; name: string; description: string; template: string }[]
  updateFlowId: (flowName: string, flowId: string) => Promise<void>
  credentials?: { businessId?: string; wabaId?: string }
}) => {
  const { t } = useTranslate()
  const { bot } = useBot()
  const [flowIds, setFlowIds] = useState(bot?.settings.whatsApp?.flowIds ?? {})

  const handleFlowIdChange = (flowName: string, flowId: string) => {
    setFlowIds((prev) => ({ ...prev, [flowName]: flowId }))
  }

  const handleBlur = (flowName: string, flowId: string) => {
    if (flowId !== (bot?.settings.whatsApp?.flowIds?.[flowName] ?? '')) {
      updateFlowId(flowName, flowId)
    }
  }

  const whatsAppManagerUrl =
    credentials?.businessId && credentials?.wabaId
      ? `https://business.facebook.com/latest/whatsapp_manager/flows/?asset_id=${credentials.wabaId}&business_id=${credentials.businessId}`
      : 'https://business.facebook.com/latest/whatsapp_manager/flows'

  return (
    <Stack spacing={4} w="full">
      <TextLink href={whatsAppManagerUrl} isExternal>
        {t('publish.whatsapp.flowTemplates.createFlow')}
      </TextLink>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>{t('publish.whatsapp.flowTemplates.name')}</Th>
            <Th>{t('publish.whatsapp.flowTemplates.description')}</Th>
            <Th>{t('publish.whatsapp.flowTemplates.copy')}</Th>
            <Th>{t('publish.whatsapp.flowTemplates.flowId')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {templates.map((template) => (
            <Tr key={template.id}>
              <Td>{template.name}</Td>
              <Td>{template.description}</Td>
              <Td>
                <CopyButton json={template.template} />
              </Td>
              <Td>
                <Input
                  size="sm"
                  value={flowIds[template.id] ?? ''}
                  onChange={(e) => handleFlowIdChange(template.id, e.target.value)}
                  onBlur={(e) => handleBlur(template.id, e.target.value)}
                  placeholder={t('publish.whatsapp.flowTemplates.flowIdPlaceholder')}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Stack>
  )
}

const DEFAULT_SESSION_TIMEOUT = 2 // Default 2 hours

export const WhatsAppModalContent = (): JSX.Element => {
  const { bot, updateBot, isPublished } = useBot()
  const { t } = useTranslate()
  const { workspace } = useWorkspace()
  const { showToast } = useToast()
  const {
    isOpen: isCredentialsModalOpen,
    onOpen,
    onClose: onCredentialsModalClose,
  } = useDisclosure()

  const hasWhatsapp = workspace?.billingPlan?.allowWhatsapp

  const whatsAppSettings = bot?.settings.whatsApp
  const hasValidCredentials = !!bot?.whatsAppCredentialsId

  const { data: credentials } = trpc.whatsAppInternal.getWhatsAppCredentials.useQuery(
    {
      credentialsId: bot?.whatsAppCredentialsId as string,
    },
    {
      enabled: hasValidCredentials,
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  )

  // Local state for session timeout with default value
  const [sessionTimeout, setSessionTimeout] = useState<number>(
    whatsAppSettings?.sessionExpiryTimeout ?? DEFAULT_SESSION_TIMEOUT,
  )

  // State to track if configuration is being saved and published
  const [isPublishingAfterConfig, setIsPublishingAfterConfig] = useState(false)
  const [isFlowTemplatesEnabled, setIsFlowTemplatesEnabled] = useState(true)

  const { data: phoneNumberData, error: phoneNumberError } =
    trpc.whatsAppInternal.getPhoneNumber.useQuery(
      {
        credentialsId: bot?.whatsAppCredentialsId as string,
      },
      {
        enabled: hasValidCredentials,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
        retry: false,
        onError: (err) => {
          console.error('Failed to fetch WhatsApp phone number:', err)
        },
      },
    )

  const checkPhoneNumberMutation = trpc.whatsAppInternal.checkWhatsAppCredentialId.useMutation()

  // Mutation for publishing bot
  const publishBotMutation = trpc.bot.publishBot.useMutation({
    onSuccess: () => {
      setIsPublishingAfterConfig(false)
    },
    onError: (error) => {
      showToast({
        status: 'error',
        description: t('publish.whatsapp.error.publishFailed'),
        detailsTitle: t('toast.details'),
        details: {
          content: error.message,
          lang: 'json',
        },
      })
      setIsPublishingAfterConfig(false)
    },
  })

  const updateFlowId = async (flowName: string, flowId: string) => {
    if (!bot) return
    await updateBot({
      updates: {
        settings: {
          ...bot.settings,
          whatsApp: {
            ...(bot.settings.whatsApp ?? {}),
            flowIds: {
              ...(bot.settings.whatsApp?.flowIds ?? {}),
              [flowName]: flowId,
            },
          },
        },
      },
      save: true,
    })
    if (bot.id) {
      await publishBotMutation.mutateAsync({ botId: bot.id })
    }
  }

  // Update session timeout in bot settings when local state changes
  useEffect(() => {
    if (
      !bot ||
      sessionTimeout === (whatsAppSettings?.sessionExpiryTimeout ?? DEFAULT_SESSION_TIMEOUT)
    )
      return

    const timeoutId = setTimeout(() => {
      updateBot({
        updates: {
          settings: {
            ...bot.settings,
            whatsApp: {
              ...whatsAppSettings,
              sessionExpiryTimeout: sessionTimeout,
            },
          },
        },
      })
    }, 500) // Debounce updates

    return () => clearTimeout(timeoutId)
  }, [sessionTimeout, bot, updateBot, whatsAppSettings])

  const toggleEnableWhatsApp = async (isChecked: boolean) => {
    if (!bot) return

    if (isChecked && !hasValidCredentials) {
      showToast({
        status: 'error',
        description: t('publish.whatsapp.error.noCredentials'),
      })
      return
    }

    if (isChecked && hasValidCredentials && hasPhoneNumberError) {
      showToast({
        status: 'error',
        description: t('publish.whatsapp.error.verificationPhoneNumber'),
      })
      return
    }

    if (isChecked && hasVerificationTokenError) {
      showToast({
        status: 'error',
        description: t('publish.whatsapp.error.verificationToken'),
      })
      return
    }

    // Validate session timeout before enabling
    if (isChecked && (!sessionTimeout || sessionTimeout < 0.01 || sessionTimeout > 48)) {
      showToast({
        status: 'error',
        description: t('publish.whatsapp.error.invalidTimeout'),
      })
      return
    }

    await updateBot({
      updates: {
        settings: {
          ...bot.settings,
          whatsApp: {
            ...whatsAppSettings,
            isEnabled: isChecked,
            sessionExpiryTimeout: sessionTimeout,
          },
        },
      },
      save: true,
    })

    // Auto-publish when enabling WhatsApp
    if (isChecked && bot.id) {
      setIsPublishingAfterConfig(true)
      await publishBotMutation.mutateAsync({ botId: bot.id })
    }
  }

  const updateCredentialsId = async (credentialsId?: string) => {
    if (!bot) return

    if (!credentialsId) {
      await updateBot({
        updates: {
          whatsAppCredentialsId: null,
          settings: {
            ...bot.settings,
            whatsApp: {
              ...whatsAppSettings,
              isEnabled: false,
            },
          },
        },
        save: true,
      })
      return
    }

    try {
      const result = await checkPhoneNumberMutation.mutateAsync({
        credentialsId,
        currentBotId: bot.id,
      })

      if (result.isAssigned) {
        showToast({
          status: 'error',
          description: t('publish.whatsapp.error.phoneNumberAlreadyAssigned'),
        })
        return
      }

      // Save credentials and ensure session timeout has a valid value
      await updateBot({
        updates: {
          whatsAppCredentialsId: credentialsId,
          settings: {
            ...bot.settings,
            whatsApp: {
              ...whatsAppSettings,
              isEnabled: true,
              sessionExpiryTimeout: sessionTimeout || DEFAULT_SESSION_TIMEOUT,
            },
          },
        },
        save: true,
      })

      // Auto-publish after successful configuration
      if (bot.id) {
        setIsPublishingAfterConfig(true)
        await publishBotMutation.mutateAsync({ botId: bot.id })
      }
    } catch (error) {
      console.error('Error checking phone number assignment:', error)
      showToast({
        status: 'error',
        description: t('publish.whatsapp.error.checkAssignment'),
      })
    }
  }

  const deleteTokensMutation = trpc.whatsAppInternal.deleteVerificationTokensByBotId.useMutation()

  const deleteCredentialsId = (credentialId?: string) => {
    if (!bot) return
    if (!bot.whatsAppCredentialsId) return
    if (bot.whatsAppCredentialsId !== credentialId) return

    updateBot({
      updates: {
        whatsAppCredentialsId: null,
        // Disable WhatsApp integration when credential is deleted
        settings: {
          ...bot.settings,
          whatsApp: {
            ...whatsAppSettings,
            isEnabled: false,
          },
        },
      },
      save: true,
    })
    deleteTokensMutation.mutateAsync({ botId: bot.id })
  }

  const updateStartConditionComparisons = (comparisons: Comparison[]) => {
    if (!bot) return
    updateBot({
      updates: {
        settings: {
          ...bot.settings,
          whatsApp: {
            ...whatsAppSettings,
            startCondition: {
              logicalOperator:
                whatsAppSettings?.startCondition?.logicalOperator ?? LogicalOperator.AND,
              comparisons,
            },
          },
        },
      },
    })
  }

  const updateStartConditionLogicalOperator = (logicalOperator: LogicalOperator) => {
    if (!bot) return
    updateBot({
      updates: {
        settings: {
          ...bot.settings,
          whatsApp: {
            ...whatsAppSettings,
            startCondition: {
              comparisons: whatsAppSettings?.startCondition?.comparisons ?? [],
              logicalOperator,
            },
          },
        },
      },
    })
  }

  const updateIsStartConditionEnabled = (isEnabled: boolean) => {
    if (!bot) return
    updateBot({
      updates: {
        settings: {
          ...bot.settings,
          whatsApp: {
            ...whatsAppSettings,
            startCondition: !isEnabled
              ? undefined
              : {
                comparisons: [],
                logicalOperator: LogicalOperator.AND,
              },
          },
        },
      },
    })
  }

  const updateSessionExpiryTimeout = (value?: number | string) => {
    if (!value) {
      setSessionTimeout(DEFAULT_SESSION_TIMEOUT)
      return
    }

    const numValue = Number(value)
    if (!isNaN(numValue) && numValue >= 0.01 && numValue <= 48) {
      setSessionTimeout(numValue)
    }
  }

  const webhookUrl = `${env.NEXT_PUBLIC_VIEWER_URL.at(1) ?? env.NEXT_PUBLIC_VIEWER_URL[0]
    }/api/v1/workspaces/${workspace?.id}/whatsapp/${bot?.whatsAppCredentialsId}/webhook`

  const { data: verificationTokenData, error: verificationTokenError } =
    trpc.whatsAppInternal.getVerificationToken.useQuery(
      { botId: bot?.id ?? '' },
      {
        enabled: !!bot?.id,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
        retry: false,
        onError: (err) => {
          console.error('Failed to fetch verification token:', err)
        },
      },
    )

  const { data: flowTemplates } = trpc.whatsAppInternal.getFlowTemplates.useQuery()

  const hasPhoneNumber = !!phoneNumberData?.id
  const hasVerificationToken = !!verificationTokenData?.token
  const hasPhoneNumberError = !!phoneNumberError
  const hasVerificationTokenError = !!verificationTokenError

  if (!hasWhatsapp) {
    return (
      <PremiumAlert
        message={t('publish.whatsapp.upgrade.message')}
        excludedPlans={[BillingPlanType.FREE]}
      />
    )
  }

  return (
    <>
      {!isPublished && (
        <Alert status="info">
          <AlertIcon />
          {t('publish.whatsapp.publish.alert')}
        </Alert>
      )}

      {hasValidCredentials && !hasPhoneNumber && (
        <Alert status="error">
          <AlertIcon />
          {t('publish.whatsapp.error.verificationPhoneNumber')}
        </Alert>
      )}

      {hasValidCredentials && hasPhoneNumber && hasVerificationToken && (
        <Alert status="error">
          <AlertIcon />
          {t('publish.whatsapp.error.verificationToken')}
        </Alert>
      )}

      {hasValidCredentials && hasPhoneNumber && !hasVerificationToken && (
        <Alert status="success">
          <AlertIcon />
          {t('publish.whatsapp.success.botPublished')}
        </Alert>
      )}

      <OrderedList spacing={4}>
        <ListItem>
          <FormControl direction="row" label={t('publish.whatsapp.selectPhoneNumber.label')}>
            <WhatsAppCredentialsModal
              isOpen={isCredentialsModalOpen}
              onClose={onCredentialsModalClose}
              onNewCredentials={updateCredentialsId}
              botId={bot?.id ?? ''}
            />
            {workspace && (
              <ForgedCredentialsDropdown
                type="whatsApp"
                workspaceId={workspace.id}
                currentCredentialsId={bot?.whatsAppCredentialsId ?? undefined}
                onCredentialsSelect={updateCredentialsId}
                onCredentialsCreate={onOpen}
                credentialsName={t('publish.whatsapp.credentials.name')}
                onCredentialsDelete={deleteCredentialsId}
              />
            )}
          </FormControl>
        </ListItem>
        {bot?.whatsAppCredentialsId && (
          <>
            <ListItem>
              <FormControl
                direction="row"
                label={t('publish.whatsapp.sessionTimeout.label')}
                moreInfoTooltip={t('publish.whatsapp.sessionTimeout.tooltip')}
              >
                <InputNumber
                  max={48}
                  min={0.01}
                  step={0.01}
                  defaultValue={sessionTimeout}
                  placeholder={DEFAULT_SESSION_TIMEOUT.toString()}
                  onChange={updateSessionExpiryTimeout}
                  suffix={t('publish.whatsapp.sessionTimeout.suffix')}
                />
              </FormControl>
            </ListItem>
            <ListItem>
              <SwitchWithRelatedSettings
                label={t('publish.whatsapp.flowTemplates.title')}
                moreInfoTooltip="To use advanced WhatsApp blocks such as Multiple Choice, you need to upload these flow templates to your Facebook app. Without them, the blocks will not work properly."
                defaultValue={isFlowTemplatesEnabled}
                onChange={setIsFlowTemplatesEnabled}
                boxPadding={0}
                withBorders={false}
              >
                {flowTemplates && (
                  <FlowTemplatesTable
                    templates={flowTemplates}
                    updateFlowId={updateFlowId}
                    credentials={credentials}
                  />
                )}
              </SwitchWithRelatedSettings>
            </ListItem>
            <ListItem>
              <FormControl direction="row" label={t('publish.whatsapp.enable.label')}>
                <Switch
                  isDisabled={!hasWhatsapp || isPublishingAfterConfig}
                  defaultValue={whatsAppSettings?.isEnabled ?? false}
                  onChange={toggleEnableWhatsApp}
                />
              </FormControl>
            </ListItem>
            <ListItem>
              <SwitchWithRelatedSettings
                label={t('publish.whatsapp.startCondition.label')}
                defaultValue={isDefined(whatsAppSettings?.startCondition)}
                onChange={updateIsStartConditionEnabled}
                withBorders={false}
                margin={0}
                boxPadding={0}
              >
                <TableList<Comparison>
                  initialItems={whatsAppSettings?.startCondition?.comparisons ?? []}
                  onItemsChange={updateStartConditionComparisons}
                  ComponentBetweenItems={() => (
                    <FormControl>
                      <Select<LogicalOperator>
                        selectedItem={whatsAppSettings?.startCondition?.logicalOperator}
                        onSelect={updateStartConditionLogicalOperator}
                        items={Object.values(LogicalOperator)}
                      />
                    </FormControl>
                  )}
                  addLabel={t('publish.whatsapp.startCondition.addComparison')}
                >
                  {(props) => <WhatsAppComparisonItem {...props} />}
                </TableList>
              </SwitchWithRelatedSettings>
            </ListItem>
            {hasPhoneNumber && (
              <ListItem>
                <TextLink href={`https://wa.me/${phoneNumberData.name}?text=Start`} isExternal>
                  {t('publish.whatsapp.tryItOut')}
                </TextLink>
              </ListItem>
            )}
          </>
        )}
      </OrderedList>
      {hasVerificationToken && (
        <>
          <FormControl label="Callback URL">
            <InputTextCopy isReadOnly value={webhookUrl} defaultValue={webhookUrl} />
          </FormControl>
          <FormControl label="Verify Token">
            <InputTextCopy
              isReadOnly
              value={verificationTokenData.token}
              defaultValue={verificationTokenData.token}
            />
          </FormControl>
        </>
      )}
    </>
  )
}

export const WhatsAppModal = ({ isOpen, onClose }: ModalProps): JSX.Element => {
  const { t } = useTranslate()

  const { isPublished, save } = useBot()
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveAndClose = async () => {
    setIsSaving(true)
    await save()
    setIsSaving(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('publish.whatsapp.modal.header')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody as={Stack} spacing="6">
          <WhatsAppModalContent />
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isSaving}>
            {t('cancel')}
          </Button>
          <Button colorScheme="blue" onClick={handleSaveAndClose} isLoading={isSaving}>
            {isPublished ? t('save') : t('saveAndPublish')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
