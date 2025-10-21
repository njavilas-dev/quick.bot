import { WorkspaceSettingsForm } from '@/features/workspace/components/WorkspaceSettingsForm'
import type { ReactNode } from 'react'
import Layout from '@/components/layouts/Layout'
import type { NextPageWithLayout } from '@/pages/_app'
import { BoxCard, H2 } from '@urbiport/ui'
import { Stack, Text } from '@chakra-ui/react'

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
  return <Layout>{page}</Layout>
}

export default SettingsWorkspace
