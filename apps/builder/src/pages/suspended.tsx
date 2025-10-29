import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { Text, VStack } from '@chakra-ui/react'
import { H2 } from '@urbiport/ui'
import { TextLink } from '@/components/TextLink'
import { useWorkspace } from '@/hooks/useWorkspace'
import type { ReactNode } from 'react'
import { AccountLayout } from '@/components/layouts/AccountLayout'

function Page() {
  const { replace } = useRouter()
  const { workspace } = useWorkspace()

  useEffect(() => {
    if (!workspace || workspace.isSuspended) return
    replace('/bots')
  }, [replace, workspace])

  return (
    <VStack w="full" h="100vh" justifyContent="center" spacing={4}>
      <H2> Your workspace has been suspended.</H2>
      <Text>
        We detected that one of your bots does not comply with our{' '}
        <TextLink href="https://quick.bot/terms-of-service#scam-bots" isExternal>
          terms of service
        </TextLink>
      </Text>
    </VStack>
  )
}

Page.getLayout = function getLayout(page: ReactNode) {
  return <AccountLayout>{page}</AccountLayout>
}

export default Page
