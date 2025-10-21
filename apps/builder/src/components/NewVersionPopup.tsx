import { useBot } from '@/features/editor/providers/BotProvider'
import { trpc } from '@/lib/trpc'
import { Button, DarkMode, Flex, HStack, SlideFade, Stack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { PackageIcon } from '@urbiport/icons'

export const NewVersionPopup = () => {
  const { bot, save } = useBot()
  const [isReloading, setIsReloading] = useState(false)
  const { data } = trpc.getAppVersionProcedure.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  })
  const [currentVersion, setCurrentVersion] = useState<string>()
  const [isNewVersionAvailable, setIsNewVersionAvailable] = useState(false)

  useEffect(() => {
    if (!data?.commitSha) return
    if (currentVersion === data.commitSha) return
    setCurrentVersion(data.commitSha)
    if (currentVersion === undefined) return
    setIsNewVersionAvailable(true)
  }, [data, currentVersion])

  const saveAndReload = async () => {
    if (isReloading) return
    setIsReloading(true)
    if (save) await save()
    window.location.reload()
  }

  return (
    <DarkMode>
      <SlideFade
        in={isNewVersionAvailable}
        offsetY="20px"
        style={{
          position: 'fixed',
          bottom: '18px',
          left: '18px',
          zIndex: 42,
        }}
        unmountOnExit
      >
        <Stack
          bgColor="brand.blue"
          p="4"
          px="4"
          borderRadius="lg"
          shadow="lg"
          borderWidth="1px"
          borderColor="blue.300"
          maxW="320px"
        >
          <HStack spacing={3}>
            <Stack spacing={4} color="white">
              <Stack spacing={1}>
                <HStack>
                  <PackageIcon /> <Text fontWeight="bold">New version available!</Text>
                </HStack>

                <Text fontSize="sm" color="text.light">
                  An improved version of QuickBot is available. Please reload now to upgrade.
                </Text>
              </Stack>
              <Flex justifyContent="flex-end">
                <Button size="sm" onClick={saveAndReload}>
                  {bot?.id ? 'Save and reload' : 'Reload'}
                </Button>
              </Flex>
            </Stack>
          </HStack>
        </Stack>
      </SlideFade>
    </DarkMode>
  )
}
