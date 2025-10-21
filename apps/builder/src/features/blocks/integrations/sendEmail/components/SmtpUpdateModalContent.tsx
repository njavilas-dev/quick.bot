import {
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
} from '@chakra-ui/react'
import { useUser } from '@/hooks/useUser'
import React, { useEffect, useState } from 'react'
import { isNotDefined } from '@quickbot.io/lib'
import { SmtpConfigForm } from './SmtpConfigForm'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useToast } from '@urbiport/ui'
import { testSmtpConfig } from '../queries/testSmtpConfigQuery'
import { trpc } from '@/lib/trpc'
import { SmtpCredentials } from '@quickbot.io/schemas/features/blocks/integrations/sendEmail/schema'
import { useTranslate } from '@tolgee/react'
import { useLoadingSave } from '@/hooks/useLoadingSave'

type Props = {
  credentialsId: string
  onUpdate: () => void
}

export const SmtpUpdateModalContent = ({ credentialsId, onUpdate }: Props) => {
  const { t } = useTranslate()
  const { user } = useUser()
  const { workspace } = useWorkspace()
  const [isCreating, setIsCreating] = useState(false)
  const { showToast } = useToast()
  const [smtpConfig, setSmtpConfig] = useState<SmtpCredentials['data']>()
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
    },
  )

  useEffect(() => {
    if (!existingCredentials || smtpConfig) return
    setSmtpConfig(existingCredentials.data)
  }, [existingCredentials, smtpConfig])

  const { mutate, isLoading } = trpc.credentials.updateCredentials.useMutation({
    onSettled: () => setIsCreating(false),
    onError: (error) => {
      showToast({
        detailsTitle: t('toast.details'),
        description: error.message,
        status: 'error',
      })
    },
    onSuccess: () => {
      onUpdate()
    },
  })

  useEffect(() => {
    if (isLoading) {
      setLoadingSave()
    }
  }, [isLoading, setLoadingSave])

  const handleUpdateClick = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.email || !workspace?.id || !smtpConfig) return
    setIsCreating(true)
    const { error: testSmtpError } = await testSmtpConfig(smtpConfig, user.email)
    if (testSmtpError) {
      setIsCreating(false)
      return showToast({
        detailsTitle: t('toast.details'),
        title: 'Invalid configuration',
        description: "We couldn't send the test email with your configuration",
      })
    }
    mutate({
      credentialsId,
      credentials: {
        data: smtpConfig,
        name: smtpConfig.from.email as string,
        type: 'smtp',
        workspaceId: workspace.id,
      },
    })
  }
  return (
    <ModalContent>
      <ModalHeader>Update SMTP config</ModalHeader>
      <ModalCloseButton />
      <form onSubmit={handleUpdateClick}>
        <ModalBody overflow="hidden" minW="0" maxH="70vh" overflowY="auto">
          <SmtpConfigForm config={smtpConfig} onConfigChange={setSmtpConfig} />
        </ModalBody>

        <ModalFooter>
          <Button
            type="submit"
            colorScheme="blue"
            isDisabled={
              isNotDefined(smtpConfig?.from.email) ||
              isNotDefined(smtpConfig?.host) ||
              isNotDefined(smtpConfig?.username) ||
              isNotDefined(smtpConfig?.password) ||
              isNotDefined(smtpConfig?.port)
            }
            isLoading={isCreating}
          >
            Update
          </Button>
        </ModalFooter>
      </form>
    </ModalContent>
  )
}
