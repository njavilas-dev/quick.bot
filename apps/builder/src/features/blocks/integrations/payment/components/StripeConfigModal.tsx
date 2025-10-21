import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Stack,
  Text,
  HStack,
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useToast, FormControl } from '@urbiport/ui'
import { InputTextWithVariables } from '@/components/inputs'
import { TextLink } from '@/components/TextLink'
import { StripeCredentials } from '@quickbot.io/schemas'
import { trpc } from '@/lib/trpc'
import { isNotEmpty } from '@quickbot.io/lib'
import { useUser } from '@/hooks/useUser'
import { useTranslate } from '@tolgee/react'

type Props = {
  isOpen: boolean
  onClose: () => void
  onNewCredentials: (id: string) => void
}

export const StripeConfigModal = ({ isOpen, onNewCredentials, onClose }: Props) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <StripeCreateModalContent onNewCredentials={onNewCredentials} onClose={onClose} />
    </Modal>
  )
}

export const StripeCreateModalContent = ({
  onNewCredentials,
  onClose,
}: Pick<Props, 'onClose' | 'onNewCredentials'>) => {
  const { t } = useTranslate()
  const { user } = useUser()
  const { workspace } = useWorkspace()
  const [isCreating, setIsCreating] = useState(false)
  const { showToast } = useToast()
  const [stripeConfig, setStripeConfig] = useState<StripeCredentials['data'] & { name: string }>({
    name: '',
    live: { publicKey: '', secretKey: '' },
    test: { publicKey: '', secretKey: '' },
  })
  const {
    credentials: {
      listCredentials: { refetch: refetchCredentials },
    },
  } = trpc.useContext()
  const { mutate } = trpc.credentials.createCredentials.useMutation({
    onMutate: () => setIsCreating(true),
    onSettled: () => setIsCreating(false),
    onError: (error) => {
      showToast({
        detailsTitle: t('toast.details'),
        description: error.message,
        status: 'error',
      })
    },
    onSuccess: (data) => {
      refetchCredentials()
      onNewCredentials(data.credentialsId)
      onClose()
    },
  })

  const handleNameChange = (name: string) =>
    setStripeConfig({
      ...stripeConfig,
      name,
    })

  const handlePublicKeyChange = (publicKey: string) =>
    setStripeConfig({
      ...stripeConfig,
      live: { ...stripeConfig.live, publicKey },
    })

  const handleSecretKeyChange = (secretKey: string) =>
    setStripeConfig({
      ...stripeConfig,
      live: { ...stripeConfig.live, secretKey },
    })

  const handleTestPublicKeyChange = (publicKey: string) =>
    setStripeConfig({
      ...stripeConfig,
      test: { ...stripeConfig.test, publicKey },
    })

  const handleTestSecretKeyChange = (secretKey: string) =>
    setStripeConfig({
      ...stripeConfig,
      test: { ...stripeConfig.test, secretKey },
    })

  const createCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.email || !workspace?.id) return
    mutate({
      credentials: {
        data: {
          live: stripeConfig.live,
          test: {
            publicKey: isNotEmpty(stripeConfig.test.publicKey)
              ? stripeConfig.test.publicKey
              : undefined,
            secretKey: isNotEmpty(stripeConfig.test.secretKey)
              ? stripeConfig.test.secretKey
              : undefined,
          },
        },
        name: stripeConfig.name,
        type: 'stripe',
        workspaceId: workspace.id,
      },
    })
  }

  return (
    <ModalContent>
      <ModalHeader>{t('blocks.inputs.payment.settings.stripeConfig.title.label')}</ModalHeader>
      <ModalCloseButton />
      <form onSubmit={createCredentials}>
        <ModalBody>
          <Stack spacing={6}>
            <FormControl
              isRequired
              label={t('blocks.inputs.payment.settings.stripeConfig.accountName.label')}
            >
              <InputTextWithVariables
                onChange={handleNameChange}
                placeholder="Stripe"

              />
            </FormControl>
            <FormControl
              label={t('blocks.inputs.payment.settings.stripeConfig.testKeys.label')}
              moreInfoTooltip={t(
                'blocks.inputs.payment.settings.stripeConfig.testKeys.infoText.label',
              )}
            >
              <HStack>
                <InputTextWithVariables
                  onChange={handleTestPublicKeyChange}
                  placeholder="pk_test_..."

                />
                <InputTextWithVariables
                  onChange={handleTestSecretKeyChange}
                  placeholder="sk_test_..."

                  type="password"
                />
              </HStack>
            </FormControl>
            <FormControl label={t('blocks.inputs.payment.settings.stripeConfig.liveKeys.label')}>
              <HStack>
                <InputTextWithVariables
                  onChange={handlePublicKeyChange}
                  placeholder="pk_live_..."

                />
                <InputTextWithVariables
                  onChange={handleSecretKeyChange}
                  placeholder="sk_live_..."
                  type="password"
                />
              </HStack>
            </FormControl>
            <Text>
              ({t('blocks.inputs.payment.settings.stripeConfig.findKeys.label')}{' '}
              <TextLink href="https://dashboard.stripe.com/apikeys" isExternal>
                {t('blocks.inputs.payment.settings.stripeConfig.findKeys.here.label')}
              </TextLink>
              )
            </Text>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button
            type="submit"
            colorScheme="blue"
            isDisabled={
              stripeConfig.live.publicKey === '' ||
              stripeConfig.name === '' ||
              stripeConfig.live.secretKey === ''
            }
            isLoading={isCreating}
          >
            {t('connect')}
          </Button>
        </ModalFooter>
      </form>
    </ModalContent>
  )
}
