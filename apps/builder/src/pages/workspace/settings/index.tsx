import { WorkspaceSettingsForm } from '@/features/workspace/components/WorkspaceSettingsForm'
import type { ReactNode } from 'react'
import type { NextPageWithLayout } from '@/pages/_app'
import { BoxCard, H2 } from '@urbiport/ui'
import { Stack, Text } from '@chakra-ui/react'
import { AccountLayout } from '@/components/layouts/AccountLayout'

const SettingsWorkspace: NextPageWithLayout = () => {
  return (
    <BoxCard>
      <Stack spacing={1}>
        <H2>Settings</H2>
        <Text fontSize="sm" color="text.light">
          Setup your workspace settings.
        </Text>
      </Stack>
      <WorkspaceSettingsForm />
    </BoxCard>
  )
}

SettingsWorkspace.getLayout = function getLayout(page: ReactNode) {
  return <AccountLayout>{page}</AccountLayout>
}

export default SettingsWorkspace
