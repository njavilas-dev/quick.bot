import { ChevronDownIcon } from '@urbiport/icons'
import { Button, MenuItem, Tag, HStack, Text } from '@chakra-ui/react'
import { runtimes } from '../data'
import { DropdownMenu } from '@urbiport/ui'
import { useWorkspace } from '@/hooks/useWorkspace'

type Runtime = (typeof runtimes)[number]

type Props = {
  selectedRuntime: Runtime
  onSelectRuntime: (runtime: Runtime) => void
}

export const ClientDropdown = ({ selectedRuntime, onSelectRuntime }: Props) => {
  const { workspace } = useWorkspace()
  const allowWhatsapp = workspace?.billingPlan?.allowWhatsapp || false

  const runtimesList = allowWhatsapp
    ? runtimes
    : runtimes?.filter((runtime) => runtime?.name !== 'WhatsApp')

  if (runtimesList.length < 2) {
    return null
  }

  return (
    <DropdownMenu
      matchWidth={false}
      placement={'bottom-start'}
      menuButton={
        <HStack justifyContent="space-between">
          <Text>{selectedRuntime.name}</Text>
          {'status' in selectedRuntime && typeof selectedRuntime.status === 'string' ? (
            <Tag variant="orange">{selectedRuntime.status}</Tag>
          ) : null}
        </HStack>
      }
      menuButtonProps={{
        as: Button,
        display: 'flex',
        variant: 'unstyled',
        color: 'white',
        backgroundColor: 'transparent',
        leftIcon: selectedRuntime.icon,
        rightIcon: <ChevronDownIcon />,
      }}
    >
      {runtimesList
        .filter((runtime) => runtime.name !== selectedRuntime.name)
        .map((runtime) => (
          <MenuItem key={runtime.name} icon={runtime.icon} onClick={() => onSelectRuntime(runtime)}>
            <HStack justifyContent="space-between">
              <Text>{runtime.name}</Text>
              {'status' in runtime && typeof runtime.status === 'string' ? (
                <Tag variant="orange">{runtime.status}</Tag>
              ) : null}
            </HStack>
          </MenuItem>
        ))}
    </DropdownMenu>
  )
}
