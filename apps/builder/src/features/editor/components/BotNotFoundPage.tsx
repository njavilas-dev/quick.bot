import { ChevronLeftIcon } from '@urbiport/icons'
import { useUser } from '@/hooks/useUser'
import { Button, Flex, Link, VStack, Text, Spinner } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { H1 } from '@urbiport/ui'

export const BotNotFoundPage = () => {
  const { replace, asPath } = useRouter()
  const { user, isLoading } = useUser()

  useEffect(() => {
    if (user || isLoading) return
    replace({
      pathname: '/signin',
      query: {
        redirectPath: asPath,
      },
    })
  }, [asPath, isLoading, replace, user])

  return (
    <Flex justify="center" align="center" w="full" h="100vh">
      {user ? (
        <VStack spacing={6}>
          <VStack>
            <H1>404</H1>
            <Text>Bot not found.</Text>
          </VStack>
          <Button as={Link} href="/bots" colorScheme="blue" leftIcon={<ChevronLeftIcon />}>
            Dashboard
          </Button>
        </VStack>
      ) : (
        <Spinner />
      )}
    </Flex>
  )
}
