import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { VStack, Text } from '@chakra-ui/react'
import { useWorkspace } from '@/hooks/useWorkspace'
import { H2 } from '@urbiport/ui'
import { BillingPortalButton } from '@/features/billing/components/BillingPortalButton'
import type { ReactNode } from 'react'
import { AccountLayout } from '@/components/layouts/AccountLayout'

function Page() {
  const { replace } = useRouter()
  const { workspace } = useWorkspace()

  useEffect(() => {
    if (!workspace || workspace.isPastDue) return
    replace('/bots')
  }, [replace, workspace])

  return (
    <VStack w="full" h="100vh" justifyContent="center" spacing={4}>
      <H2>Your workspace has unpaid invoice(s).</H2>
      <Text>Head over to the billing portal to pay it.</Text>
      {workspace?.id && <BillingPortalButton workspace={workspace} />}
    </VStack>
  )
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <AccountLayout>{page}</AccountLayout>
}

export default Page
