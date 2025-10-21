import { InputTextWithVariables } from '@/components/inputs'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useToast } from '@urbiport/ui'
import { trpc } from '@/lib/trpc'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Stack,
  ModalFooter,
  Button,
  Skeleton,
} from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { ZodObjectLayout } from '../zodLayouts/ZodObjectLayout'
import { ForgedBlockDefinition } from '@quickbot.io/forge-repository/types'
import { Credentials } from '@quickbot.io/schemas'
import { useTranslate } from '@tolgee/react'
import { FormControl } from '@urbiport/ui'
import { useLoadingSave } from '@/hooks/useLoadingSave'

type BaseProps = {
  blockDef: ForgedBlockDefinition
  isOpen: boolean
  onClose: () => void
}

type CreateModeProps = BaseProps & {
  mode: 'create'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultData?: any
  onNewCredentials: (id: string) => void
}

type UpdateModeProps = BaseProps & {
  mode: 'update'
  credentialsId: string
  initialData?: {
    name?: string
  }
  onUpdate: () => void
}

type Props = CreateModeProps | UpdateModeProps

export const ForgedCredentialsModal = (props: Props) => {
  if (!props.blockDef.auth) return null

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} size="lg">
      <ModalOverlay />
      <ForgedCredentialsModalContent {...props} />
    </Modal>
  )
}

export const ForgedCredentialsModalContent = (props: Props) => {
  const { t } = useTranslate()
  const { workspace } = useWorkspace()
  const { showToast } = useToast()
  const [name, setName] = useState(
    props.mode === 'update' ? props.initialData?.name || '' : ''
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(
    props.mode === 'create' && props.defaultData ? props.defaultData : {}
  )
  const setLoadingSave = useLoadingSave()
  const [isProcessing, setIsProcessing] = useState(false)

  // Get existing credentials for update mode
  const { data: existingCredentials, isLoading: isLoadingCredentials } =
    trpc.credentials.getCredentials.useQuery(
      {
        credentialsId: props.mode === 'update' ? props.credentialsId : '',
        workspaceId: workspace?.id ?? '',
      },
      {
        enabled: props.mode === 'update' && !!workspace?.id,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
      }
    )

  // Update state when existing credentials are loaded
  useEffect(() => {
    if (props.mode === 'update' && existingCredentials) {
      if (!props.initialData?.name) {
        setName(existingCredentials.name)
      }
      if (!data || Object.keys(data).length === 0) {
        setData(existingCredentials.data)
      }
    }
  }, [existingCredentials, data, props])

  // Get trpc context for refetching
  const {
    credentials: {
      listCredentials: { refetch: refetchCredentials },
    },
  } = trpc.useContext()

  // Create mutation
  const createMutation = trpc.credentials.createCredentials.useMutation({
    onMutate: () => setIsProcessing(true),
    onSettled: () => setIsProcessing(false),
    onError: (error) => handleError(error),
    onSuccess: (data) => {
      refetchCredentials()
      if (props.mode === 'create') {
        props.onClose()
        props.onNewCredentials(data.credentialsId)
      }
    },
  })

  // Update mutation
  const updateMutation = trpc.credentials.updateCredentials.useMutation({
    onMutate: () => setIsProcessing(true),
    onSettled: () => setIsProcessing(false),
    onError: (error) => handleError(error),
    onSuccess: () => {
      if (props.mode === 'update') {
        props.onUpdate()
      }
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleError = (error: any) => {
    const zodError = error?.data?.zodError
    let errorMessage = error.message

    if (zodError?.fieldErrors) {
      const firstFieldErrors = Object.values(zodError.fieldErrors)[0] as string[] | undefined
      if (firstFieldErrors && firstFieldErrors.length > 0) {
        errorMessage = firstFieldErrors[0]
      }
    }

    showToast({
      detailsTitle: t('toast.details'),
      description: errorMessage,
      status: 'error',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspace || !props.blockDef.auth) return

    const credentials = {
      type: props.blockDef.id,
      workspaceId: workspace.id,
      name,
      data,
    } as Credentials

    if (props.mode === 'create') {
      createMutation.mutate({ credentials })
    } else {
      updateMutation.mutate({
        credentialsId: props.credentialsId,
        credentials,
      })
    }
  }

  useEffect(() => {
    if (isProcessing) {
      setLoadingSave()
    }
  }, [isProcessing, setLoadingSave])

  if (!props.blockDef.auth) return null

  const isLoading = props.mode === 'update' && isLoadingCredentials && !data
  const isDisabled = !data || Object.keys(data).length === 0 || name.trim().length === 0

  return (
    <ModalContent>
      <ModalHeader>
        {props.mode === 'create' ? 'Add' : 'Update'} {props.blockDef.auth.name}
      </ModalHeader>
      <ModalCloseButton />
      <form onSubmit={handleSubmit}>
        <ModalBody as={Stack} spacing="6">
          <FormControl isRequired label="Name">
            <InputTextWithVariables
              defaultValue={name}
              onChange={setName}
              placeholder="My account"
            />
          </FormControl>
          {isLoading ? (
            <Stack spacing="4">
              <Skeleton height="40px" borderRadius="md" />
              <Skeleton height="40px" borderRadius="md" />
              <Skeleton height="40px" borderRadius="md" />
              <Skeleton height="40px" borderRadius="md" />
            </Stack>
          ) : (
            <ZodObjectLayout
              schema={props.blockDef.auth.schema}
              data={data}
              onDataChange={setData}
            />
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            type="submit"
            isLoading={isProcessing}
            isDisabled={isDisabled}
            colorScheme="blue"
          >
            {props.mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </ModalFooter>
      </form>
    </ModalContent>
  )
}