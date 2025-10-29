import {
  useToast,
  InputTextCopy,
  StepIndicator,
  StepSeparator,
  Select as UiSelect,
} from '@urbiport/ui'
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, PhoneIcon, UserIcon } from '@urbiport/icons'
import { InputTextWithVariables } from '@/components/inputs'
import { useWorkspace } from '@/hooks/useWorkspace'
import { trpc, trpcVanilla } from '@/lib/trpc'
import {
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Stack,
  ModalFooter,
  Stepper,
  useSteps,
  Step,
  Box,
  StepNumber,
  StepStatus,
  StepTitle,
  UnorderedList,
  ListItem,
  Text,
  Image,
  Button,
  IconButton,
  OrderedList,
  Link,
  Code,
  HStack,
  VStack,
  Spinner,
  Badge,
} from '@chakra-ui/react'
import { isEmpty, isNotEmpty } from '@quickbot.io/lib'
import React, { useState, createContext } from 'react'
import { createId } from '@quickbot.io/lib/createId'
import { useTranslate } from '@tolgee/react'
import { FormControl } from '@urbiport/ui'
import { env } from '@quickbot.io/env'
import ky from 'ky'
import { useBot } from '@/features/editor/providers/BotProvider'

type WhatsAppCredentialsContextType = {
  isSubmitted: boolean
}

const WhatsAppCredentialsContext = createContext<WhatsAppCredentialsContextType>({
  isSubmitted: false,
})

const steps = [
  { title: 'Requirements' },
  { title: 'User Token' },
  { title: 'Business ID' },
  { title: 'Phone Number' },
  { title: 'Webhook' },
]

type Props = {
  isOpen: boolean
  onClose: () => void
  onNewCredentials: (id: string) => void
  botId: string
}

const credentialsId = createId()

export const WhatsAppCredentialsModal = ({ isOpen, onClose, onNewCredentials }: Props) => {
  const { bot } = useBot()
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalOverlay />
      <WhatsAppCreateModalContent
        onNewCredentials={onNewCredentials}
        onClose={onClose}
        botId={bot?.id ?? ''}
      />
    </Modal>
  )
}

export const WhatsAppCreateModalContent = ({
  onNewCredentials,
  onClose,
  botId,
}: Pick<Props, 'onNewCredentials' | 'onClose' | 'botId'>) => {
  const { t } = useTranslate()
  const { workspace } = useWorkspace()
  const { showToast } = useToast()
  const { activeStep, goToNext, goToPrevious } = useSteps({
    index: 0,
    count: steps.length,
  })
  const [systemUserAccessToken, setSystemUserAccessToken] = useState('')
  const [businessId, setBusinessId] = useState('')
  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [wabaId, setWabaId] = useState('')
  const [verificationToken, setVerificationToken] = useState('')
  const [stepLoadingStates, setStepLoadingStates] = useState<Record<number, boolean>>({
    1: false, // validateToken
    2: false, // businessId
    3: false, // getPhoneNumberAndVerify + createCredentials
    4: false, // final step
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const isCurrentStepLoading = stepLoadingStates[activeStep + 1] || false

  const {
    credentials: {
      listCredentials: { refetch: refetchCredentials },
    },
    whatsAppInternal: {
      getVerificationToken: { invalidate: invalidateVerificationToken },
    },
  } = trpc.useContext()

  const { data: tokenInfoData } = trpc.whatsAppInternal.getSystemTokenInfo.useQuery(
    {
      token: systemUserAccessToken,
    },
    {
      enabled: isNotEmpty(systemUserAccessToken),
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
    },
  )

  const createCredentials = async (
    token: string,
    phoneId: string,
    phoneNumber: string,
    wabaId: string,
    businessId: string,
  ): Promise<boolean> => {
    if (!workspace) return false

    setIsSubmitted(true)

    try {
      await trpcVanilla.credentials.createCredentials.mutate({
        credentials: {
          id: credentialsId,
          type: 'whatsApp',
          workspaceId: workspace.id,
          name: phoneNumber,
          data: {
            systemUserAccessToken: token,
            phoneNumberId: phoneId,
            wabaId,
            businessId,
          },
        },
      })

      refetchCredentials()
      onNewCredentials(credentialsId)
      return true
    } catch (error) {
      showToast({
        detailsTitle: t('toast.details'),
        description: error instanceof Error ? error.message : 'Error creating credentials',
        status: 'error',
      })
      return false
    }
  }

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const tokenInfo = await trpcVanilla.whatsAppInternal.getSystemTokenInfo.query({
        token,
      })

      // Validate token expiration
      if (tokenInfo.expiresAt !== 0) {
        showToast({
          detailsTitle: t('toast.details'),
          description:
            'Token expiration was not set to *never*. Create the token again with the correct expiration.',
        })
        return false
      }

      // Validate token scopes
      const requiredScopes = [
        'business_management',
        'whatsapp_business_management',
        'whatsapp_business_messaging',
      ]
      const missingScopes = requiredScopes.filter((scope) => !tokenInfo.scopes.includes(scope))

      if (missingScopes.length > 0) {
        showToast({
          detailsTitle: t('toast.details'),
          description: 'Token does not have all the necessary scopes',
        })
        return false
      }

      return true
    } catch (error) {
      showToast({
        detailsTitle: t('toast.details'),
        description: 'Could not get system info',
        details: error instanceof Error ? { content: error.message, lang: 'json' } : undefined,
      })
      return false
    }
  }

  const getPhoneNumberAndVerify = async (
    token: string,
    phoneId: string,
  ): Promise<{
    success: boolean
    phoneNumber?: string
    token?: string
  }> => {
    try {
      // Step 1: Get phone number info
      const phoneInfo = await trpcVanilla.whatsAppInternal.getPhoneNumber.query({
        systemToken: token,
        phoneNumberId: phoneId,
      })

      if (!phoneInfo || !phoneInfo.name) {
        showToast({
          detailsTitle: t('toast.details'),
          description: 'Could not get phone number info',
        })
        return { success: false }
      }

      // Step 2: Verify availability
      const { message } = await trpcVanilla.whatsAppInternal.verifyIfPhoneNumberAvailable.query({
        phoneNumberDisplayName: phoneInfo.name,
      })

      if (message === 'taken') {
        showToast({
          detailsTitle: t('toast.details'),
          description: 'Phone number is already registered on QuickBot',
        })
        return { success: false }
      }

      // Step 3: Generate verification token
      const { verificationToken } =
        await trpcVanilla.whatsAppInternal.generateVerificationToken.mutate({
          botId: botId ?? '',
        })
      setVerificationToken(verificationToken)

      // Invalidate verification token cache to trigger refetch
      await invalidateVerificationToken({ botId: botId ?? '' })

      return {
        success: true,
        phoneNumber: phoneInfo.name,
        token: verificationToken,
      }
    } catch (error) {
      showToast({
        detailsTitle: t('toast.details'),
        description: 'Error processing phone number',
        details: error instanceof Error ? { content: error.message, lang: 'json' } : undefined,
      })
      return { success: false }
    }
  }

  const pingViewerEndpoint = async () => {
    const viewerUrl = env.NEXT_PUBLIC_VIEWER_URL.at(1) ?? env.NEXT_PUBLIC_VIEWER_URL[0]
    const pingUrl = `${viewerUrl}/api/health`
    return await ky.get(pingUrl, {
      retry: 2,
      timeout: 5000,
      headers: {
        Accept: 'application/json',
      },
    })
  }

  const goToNextStep = async () => {
    const currentStep = activeStep + 1

    // Set loading state for current step
    setStepLoadingStates((prev) => ({ ...prev, [currentStep]: true }))

    try {
      if (activeStep === 1) {
        if (!(await validateToken(systemUserAccessToken))) {
          return
        }
      }
      if (activeStep === 3) {
        const result = await getPhoneNumberAndVerify(systemUserAccessToken, phoneNumberId)
        if (!result.success || !result.phoneNumber) {
          return
        }

        const ping = await pingViewerEndpoint()

        if (!ping) {
          showToast({
            detailsTitle: t('toast.details'),
            description:
              'Failed to connect to viewer endpoint. Please check if the viewer service is running.',
            status: 'error',
          })
          return
        }

        const success = await createCredentials(
          systemUserAccessToken,
          phoneNumberId,
          result.phoneNumber,
          wabaId,
          businessId,
        )
        if (!success) {
          return
        }
      }
      if (activeStep === 4) {
        // Final verification before closing
        const verificationCheck = await trpcVanilla.whatsAppInternal.getVerificationToken.query({
          botId: botId ?? '',
        })

        if (verificationCheck?.token) {
          showToast({
            status: 'error',
            description: 'Please complete the webhook verification in Facebook before closing.',
            detailsTitle: t('toast.details'),
          })
          return
        }

        showToast({
          status: 'success',
          description: 'WhatsApp integration configured successfully!',
        })

        return onClose()
      }
      goToNext()
    } finally {
      // Clear loading state for current step
      setStepLoadingStates((prev) => ({ ...prev, [currentStep]: false }))
    }
  }
  return (
    <WhatsAppCredentialsContext.Provider value={{ isSubmitted }}>
      <ModalContent maxH="90vh">
        <ModalHeader>
          <HStack h="40px">
            <Text>Add a WhatsApp phone number</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody as={Stack} spacing="10">
          <Stepper index={activeStep} size="sm" pt="4">
            {steps.map((step, index) => (
              <Step key={index}>
                <StepIndicator>
                  <StepStatus
                    complete={<CheckIcon />}
                    incomplete={<StepNumber />}
                    active={<StepNumber />}
                  />
                </StepIndicator>

                <Box flexShrink="0">
                  <StepTitle>{step.title}</StepTitle>
                </Box>

                <StepSeparator />
              </Step>
            ))}
          </Stepper>
          {activeStep === 0 && <Requirements />}
          {activeStep === 1 && (
            <SystemUserToken
              initialToken={systemUserAccessToken}
              setToken={setSystemUserAccessToken}
            />
          )}
          {activeStep === 2 && (
            <BusinessId initialBusinessId={businessId} setBusinessId={setBusinessId} />
          )}
          {activeStep === 3 && (
            <PhoneNumber
              appId={tokenInfoData?.appId}
              initialPhoneNumberId={phoneNumberId}
              setPhoneNumberId={setPhoneNumberId}
              businessId={businessId}
              systemUserAccessToken={systemUserAccessToken}
              wabaId={wabaId}
              setWabaId={setWabaId}
            />
          )}
          {activeStep === 4 && (
            <Webhook
              appId={tokenInfoData?.appId}
              verificationToken={verificationToken}
              credentialsId={credentialsId}
              botId={botId}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <HStack spacing={4} w="full" justifyContent="space-between">
            <IconButton
              isDisabled={activeStep === 0 || isSubmitted || isCurrentStepLoading}
              icon={<ChevronLeftIcon />}
              aria-label={'Go back'}
              variant="outline"
              onClick={goToPrevious}
            />
            <Button
              onClick={goToNextStep}
              variant="outline"
              isDisabled={
                isCurrentStepLoading ||
                (activeStep === 1 && isEmpty(systemUserAccessToken)) ||
                (activeStep === 2 && isEmpty(businessId)) ||
                (activeStep === 3 && isEmpty(phoneNumberId))
              }
              isLoading={isCurrentStepLoading}
              rightIcon={activeStep === steps.length - 1 ? undefined : <ChevronRightIcon />}
            >
              {activeStep === steps.length - 1 ? 'Done' : 'Continue'}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </WhatsAppCredentialsContext.Provider>
  )
}

const Requirements = () => (
  <Stack spacing={4}>
    <Text>
      Make sure you have{' '}
      <Link
        href="https://docs.quick.bot/builder/deploy/whatsapp#step-1-—-create-a-meta-app"
        color="brand.primary"
        isExternal
      >
        created a WhatsApp Meta app
      </Link>
      . You should be able to get to this page:
    </Text>
    <Image
      src="/images/whatsapp-quickstart-page.png"
      alt="WhatsApp quickstart page"
      borderRadius="md"
    />
  </Stack>
)

const SystemUserToken = ({
  initialToken,
  setToken,
}: {
  initialToken: string
  setToken: (id: string) => void
}) => (
  <OrderedList spacing={4}>
    <ListItem>
      Go to your{' '}
      <Link
        href="https://business.facebook.com/settings/system-users"
        isExternal
        color="brand.primary"
      >
        System users page
      </Link>
    </ListItem>
    <ListItem>
      Create a new user by clicking on <Code>Add</Code>
    </ListItem>
    <ListItem>
      Fill it with any name and give it the <Code>Admin</Code> role
    </ListItem>
    <ListItem>
      <Stack>
        <Text>
          Click on the user created and click on <Code>Add Assets</Code>
        </Text>
      </Stack>
    </ListItem>
    <ListItem>
      <Stack>
        <Text>
          Click on the <Code>three dots icon</Code> and select <Code>Assign assets</Code>. Then add
          your WhatsApp Meta app created on{' '}
          <Link
            href="https://docs.quick.bot/builder/deploy/whatsapp#step-1-—-create-a-meta-app"
            isExternal
            color="brand.primary"
          >
            WhatsApp Meta app
          </Link>
          . Give it <Code>Full control</Code> permissions.
        </Text>
        <Image src="/images/whatsapp-user-token.png" alt="WhatsApp user token setup" />
      </Stack>
    </ListItem>
    <ListItem>
      <Stack>
        <Text>
          Now click on <Code>Generate Token</Code> and select your app
        </Text>
      </Stack>
    </ListItem>
    <ListItem>
      <Stack spacing={4}>
        <Text>After select your app, select this options.</Text>
        <UnorderedList spacing={4}>
          <ListItem>
            Token expiration: <Code>Never</Code>
          </ListItem>
          <ListItem>
            Available Permissions: <Code>business_management</Code>,{' '}
            <Code>whatsapp_business_messaging</Code>, <Code>whatsapp_business_management</Code>
          </ListItem>
        </UnorderedList>
      </Stack>
    </ListItem>
    <ListItem>Copy and paste the generated token:</ListItem>
    <FormControl isRequired helperText="System User Token">
      <InputTextWithVariables
        type="password"
        defaultValue={initialToken}
        onChange={(val) => setToken(val.trim())}
      />
    </FormControl>
  </OrderedList>
)

const BusinessId = ({
  initialBusinessId,
  setBusinessId,
}: {
  initialBusinessId: string
  setBusinessId: (id: string) => void
}) => (
  <OrderedList spacing={4}>
    <ListItem>
      Go to your{' '}
      <Link href="https://business.facebook.com/settings/info" isExternal color="brand.primary">
        Business settings page
      </Link>
      , and copy your Business ID.
    </ListItem>
    <ListItem>
      <Stack>
        <Text>
          Paste the associated <Code>Business ID</Code>
        </Text>
        <VStack spacing={4}>
          <FormControl isRequired helperText="Business ID">
            <InputTextWithVariables defaultValue={initialBusinessId} onChange={setBusinessId} />
          </FormControl>
          <Image src="/images/whatsapp-business-id-page.png" alt="WA business id" />
        </VStack>
      </Stack>
    </ListItem>
  </OrderedList>
)

const PhoneNumber = ({
  initialPhoneNumberId,
  setPhoneNumberId,
  businessId,
  systemUserAccessToken,
  wabaId,
  setWabaId,
}: {
  appId?: string
  initialPhoneNumberId: string
  setPhoneNumberId: (id: string) => void
  businessId: string
  systemUserAccessToken: string
  wabaId: string
  setWabaId: (id: string) => void
}) => {
  const { t } = useTranslate()
  const { data: businessAccounts, isLoading: isBusinessAccountsLoading } =
    trpc.whatsAppInternal.getWhatsAppBusinessAccounts.useQuery(
      {
        businessId,
        accessToken: systemUserAccessToken,
      },
      {
        enabled: isNotEmpty(businessId) && isNotEmpty(systemUserAccessToken),
        onSuccess: (data) => {
          if (data && data.length > 0) {
            setWabaId(data[0].id)
          }
        },
      },
    )

  const { data: phoneNumbers, isLoading: isPhoneNumbersLoading } =
    trpc.whatsAppInternal.getPhoneNumbers.useQuery(
      {
        businessId: wabaId,
        accessToken: systemUserAccessToken,
      },
      {
        enabled: isNotEmpty(wabaId) && isNotEmpty(systemUserAccessToken),
        onSuccess: (data) => {
          if (data && data.length > 0) {
            setPhoneNumberId(data[0].id)
          }
        },
      },
    )

  const showPhoneNumbersAlertInfo =
    (businessAccounts && businessAccounts.length === 0) ||
    (!isPhoneNumbersLoading && phoneNumbers && phoneNumbers?.length === 0)

  return (
    <OrderedList spacing={4}>
      <ListItem>
        <Text>Select a Whatsapp Business Account</Text>
        <VStack spacing={4}>
          {isBusinessAccountsLoading && <Spinner />}
          {!isBusinessAccountsLoading && businessAccounts && businessAccounts.length > 0 && (
            <FormControl isRequired helperText="WhatsApp Business Account">
              <UiSelect
                placeholder="Select WhatsApp Business Account"
                items={
                  businessAccounts?.map((account) => ({
                    icon: <UserIcon />,
                    label: account.name,
                    value: account.id,
                    badge: (
                      <Badge colorScheme="gray" fontSize="xs">
                        {account.id}
                      </Badge>
                    ),
                  })) || []
                }
                selectedItem={wabaId}
                onSelect={(value) => setWabaId(value || '')}
                withClear={false}
                usePortal={true}
                zIndex={10000}
              />
            </FormControl>
          )}
          {!isBusinessAccountsLoading && businessAccounts?.length === 0 && (
            <Alert status="info">
              <Text>
                {t('whatsappModal.noBusinessAccount')}
                <Link
                  href={`https://business.facebook.com/latest/settings/whatsapp_account?business_id=${businessId}`}
                  isExternal
                  textDecoration="underline"
                >
                  {t('whatsappModal.noBusinessAccount.link')}
                </Link>
              </Text>
            </Alert>
          )}
        </VStack>
      </ListItem>
      <ListItem>
        <Stack>
          <Text>Select a phone number</Text>
          <VStack spacing={4}>
            {isPhoneNumbersLoading && businessAccounts && businessAccounts.length > 0 && (
              <Spinner />
            )}
            {!isPhoneNumbersLoading && phoneNumbers && phoneNumbers?.length > 0 && (
              <FormControl isRequired helperText="Phone number">
                <UiSelect
                  placeholder="Select phone number"
                  items={
                    phoneNumbers?.map((phoneNumber) => ({
                      icon: <PhoneIcon />,
                      label: phoneNumber.verified_name,
                      value: phoneNumber.id,
                      badge: (
                        <Badge colorScheme="blue" fontSize="xs">
                          {phoneNumber.display_phone_number}
                        </Badge>
                      ),
                    })) || []
                  }
                  selectedItem={initialPhoneNumberId}
                  onSelect={(value) => setPhoneNumberId(value || '')}
                  withClear={false}
                  usePortal={true}
                  zIndex={10000}
                />
              </FormControl>
            )}
            {showPhoneNumbersAlertInfo && (
              <Alert status="info">
                <Text>
                  {t('whatsappModal.noPhoneNumber')}
                  <Link
                    href={`https://business.facebook.com/latest/whatsapp_manager/phone_numbers/?business_id=${businessId}&asset_id=${wabaId}`}
                    isExternal
                    textDecoration="underline"
                  >
                    {t('whatsappModal.noPhoneNumber.link')}
                  </Link>
                </Text>
              </Alert>
            )}
          </VStack>
        </Stack>
      </ListItem>
    </OrderedList>
  )
}

const Webhook = ({
  appId,
  verificationToken,
  credentialsId,
  botId,
}: {
  appId?: string
  verificationToken: string
  credentialsId: string
  botId: string
}) => {
  const { workspace } = useWorkspace()
  const webhookUrl = `${
    env.NEXT_PUBLIC_VIEWER_URL.at(1) ?? env.NEXT_PUBLIC_VIEWER_URL[0]
  }/api/v1/workspaces/${workspace?.id}/whatsapp/${credentialsId}/webhook`

  // Check if webhook is verified (token deleted by Facebook)
  const { data: currentToken } = trpc.whatsAppInternal.getVerificationToken.useQuery(
    { botId },
    {
      enabled: !!botId,
      refetchInterval: 2000, // Poll every 2 seconds
      refetchIntervalInBackground: true,
    },
  )

  const isWebhookVerified = !currentToken?.token

  return (
    <Stack spacing={6}>
      <>
        {isWebhookVerified ? (
          <Alert status="success">
            <AlertIcon />
            Webhook verified successfully! Your WhatsApp integration is ready to use.
          </Alert>
        ) : (
          <Alert status="info">
            <AlertIcon />
            Your WhatsApp credentials have been created. Please verify the webhook in Facebook to
            complete the setup.
          </Alert>
        )}
      </>
      <OrderedList spacing={4}>
        <ListItem>
          <Text>
            In your{' '}
            <Link
              href={`https://developers.facebook.com/apps/${appId}/whatsapp-business/wa-settings`}
              isExternal
              color="brand.primary"
            >
              WhatsApp Settings page
            </Link>
            , click on the Edit button and insert the following values:
          </Text>
          <VStack spacing={4} pt="4">
            <FormControl helperText="Callback URL">
              <InputTextCopy isReadOnly value={webhookUrl} defaultValue={webhookUrl} />
            </FormControl>
            <FormControl helperText="Verify Token">
              <InputTextCopy
                isReadOnly
                value={verificationToken}
                defaultValue={verificationToken}
              />
            </FormControl>
          </VStack>
        </ListItem>
        <ListItem>
          <HStack>
            <Text>
              After verifying the token, the available permissions will appear. Make sure to select{' '}
              <Code>messages</Code> so the webhook works correctly.
            </Text>
          </HStack>
          <Image
            src="/images/whatsapp-events-page.png"
            alt="WhatsApp events page"
            borderRadius="md"
          />
        </ListItem>
      </OrderedList>
    </Stack>
  )
}
