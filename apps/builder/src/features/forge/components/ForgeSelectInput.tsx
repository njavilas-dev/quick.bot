import { Select } from '@urbiport/ui'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useToast } from '@urbiport/ui'
import { trpc } from '@/lib/trpc'
import { HStack, IconButton } from '@chakra-ui/react'
import { ForgedBlockDefinition, ForgedBlock } from '@quickbot.io/forge-repository/types'
import { useMemo } from 'react'
import { findFetcher } from '../helpers/findFetcher'
import { useTranslate } from '@tolgee/react'
import { VariablesDropdown } from '@/features/variables/components/VariablesDropdown'
import { VariableIcon } from '@urbiport/icons'
import { Variable } from '@quickbot.io/schemas'

type Props = {
  blockDef: ForgedBlockDefinition
  defaultValue?: string
  fetcherId: string
  options: ForgedBlock['options']
  placeholder?: string
  width?: 'full'
  withVariableButton?: boolean
  onChange: (value: string | undefined) => void
}
export const ForgeSelectInput = ({
  defaultValue,
  fetcherId,
  options,
  blockDef,
  placeholder,
  withVariableButton = false,
  onChange,
}: Props) => {
  const { t } = useTranslate()
  const { workspace } = useWorkspace()
  const { showToast } = useToast()

  const fetcher = useMemo(() => findFetcher(blockDef, fetcherId), [blockDef, fetcherId])

  const { data } = trpc.forge.fetchSelectItems.useQuery(
    {
      integrationId: blockDef.id,
      options: pick(
        options,
        (blockDef.auth ? ['credentialsId'] : []).concat(fetcher?.dependencies ?? []),
      ),
      workspaceId: workspace?.id as string,
      fetcherId,
    },
    {
      enabled: !!workspace?.id && !!fetcher,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
      onError: (error) => {
        showToast({
          detailsTitle: t('toast.details'),
          description: error.message,
          status: 'error',
        })
      },
    },
  )

  const handleVariableSelected = (variable?: Variable) => {
    if (!variable) return
    onChange(`{{${variable.name}}}`)
  }

  return (
    <HStack spacing={2} width="full">
      <Select
        items={data?.items ?? []}
        selectedItem={defaultValue}
        onSelect={onChange}
        placeholder={placeholder}
      />
      {withVariableButton && (
        <VariablesDropdown
          placement="bottom-end"
          matchWidth={false}
          onSelect={handleVariableSelected}
          menuButtonProps={{
            as: IconButton,
            variant: 'outline',
            justifyContent: 'center',
            icon: <VariableIcon color="text.light" />,
            'aria-label': t('variables.button.tooltip'),
            px: 2,
          }}
        />
      )}
    </HStack>
  )
}

function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  if (!obj) return {} as Pick<T, K>
  const ret: any = {} // eslint-disable-line @typescript-eslint/no-explicit-any
  keys.forEach((key) => {
    ret[key] = obj[key]
  })
  return ret
}
