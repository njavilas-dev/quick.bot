import { InputTextWithVariables } from '@/components/inputs'
import { TextLink } from '@/components/TextLink'
import { useUser } from '@/hooks/useUser'
import { useWorkspace } from '@/hooks/useWorkspace'
import { trpc } from '@/lib/trpc'
import {
  Text,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Stack,
  HStack,
  ModalFooter,
  Button,
} from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { isNotEmpty } from '@quickbot.io/lib'
import { StripeCredentials } from '@quickbot.io/schemas'
import { FormControl } from '@urbiport/ui'
import { useEffect, useState } from 'react'
import { useLoadingSave } from '@/hooks/useLoadingSave'

type Props = {
  credentialsId: string
  onUpdate: () => void
}

export const UpdateStripeCredentialsModalContent = ({ credentialsId, onUpdate }: Props) => {
  const { t } = useTranslate()
  const { user } = useUser()
  const { workspace } = useWorkspace()
  const [isCreating, setIsCreating] = useState(false)
  const [stripeConfig, setStripeConfig] = useState<StripeCredentials['data'] & { name: string }>()
  const setLoadingSave = useLoadingSave()
  const { data: existingCredentials } = trpc.credentials.getCredentials.useQuery(
    {
      credentialsId: credentialsId,
      workspaceId: workspace?.id ?? '',
    },
    {
      enabled: !!workspace?.id && !!credentialsId,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
    }
  )

  useEffect(() => {
    if (!existingCredentials || stripeConfig) return
    setStripeConfig({
      name: existingCredentials.name,
      live: existingCredentials.data.live,
      test: existingCredentials.data.test,
    })
  }, [existingCredentials, stripeConfig])

  const { mutate, isLoading } = trpc.credentials.updateCredentials.useMutation({
    onMutate: () => setIsCreating(true),
    onSettled: () => setIsCreating(false),
    onSuccess: () => {
      onUpdate()
    },
  })

  const handleNameChange = (name: string) =>
    stripeConfig &&
    setStripeConfig({
      ...stripeConfig,
      name,
    })

  const handlePublicKeyChange = (publicKey: string) =>
    stripeConfig &&
    setStripeConfig({
      ...stripeConfig,
      live: { ...stripeConfig.live, publicKey },
    })

  const handleSecretKeyChange = (secretKey: string) =>
    stripeConfig &&
    setStripeConfig({
      ...stripeConfig,
      live: { ...stripeConfig.live, secretKey },
    })

  const handleTestPublicKeyChange = (publicKey: string) =>
    stripeConfig &&
    setStripeConfig({
      ...stripeConfig,
      test: { ...stripeConfig.test, publicKey },
    })

  const handleTestSecretKeyChange = (secretKey: string) =>
    stripeConfig &&
    setStripeConfig({
      ...stripeConfig,
      test: { ...stripeConfig.test, secretKey },
    })

  const updateCreds = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.email || !workspace?.id || !stripeConfig) return
    mutate({
      credentialsId,
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

  useEffect(() => {
    if (isLoading) {
      setLoadingSave()
    }
  }, [isLoading, setLoadingSave])

  return (
    <ModalContent>
      <ModalHeader>{t('blocks.inputs.payment.settings.stripeConfig.title.label')}</ModalHeader>
      <ModalCloseButton />
      <form onSubmit={updateCreds}>
        <ModalBody>
          <Stack as="form" spacing={6}>
            <FormControl
              isRequired
              label={t('blocks.inputs.payment.settings.stripeConfig.accountName.label')}
            >
              <InputTextWithVariables
                defaultValue={stripeConfig?.name}
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
                  defaultValue={stripeConfig?.test?.publicKey}

                />
                <InputTextWithVariables
                  onChange={handleTestSecretKeyChange}
                  placeholder="sk_test_..."

                  defaultValue={stripeConfig?.test?.secretKey}
                  type="password"
                />
              </HStack>
            </FormControl>
            <FormControl label={t('blocks.inputs.payment.settings.stripeConfig.liveKeys.label')}>
              <HStack>
                <InputTextWithVariables
                  onChange={handlePublicKeyChange}
                  placeholder="pk_live_..."
                  defaultValue={stripeConfig?.live?.publicKey}

                />
                <InputTextWithVariables
                  onChange={handleSecretKeyChange}
                  placeholder="sk_live_..."
                  defaultValue={stripeConfig?.live?.secretKey}

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
              stripeConfig?.live.publicKey === '' ||
              stripeConfig?.name === '' ||
              stripeConfig?.live.secretKey === ''
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
