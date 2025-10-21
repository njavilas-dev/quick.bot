import { Box, CloseButton, Flex, HStack, IconButton, Text } from '@chakra-ui/react'
import { RepeatIcon } from '@urbiport/icons'
import { useEditor } from '../../editor/providers/EditorProvider'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { useBot } from '../../editor/providers/BotProvider'
import React, { useState } from 'react'
import { ClientDropdown } from './ClientDropdown'
import { runtimes } from '../data'
import { PreviewDrawerBody } from './PreviewDrawerBody'
import { useStorage } from '@/store/storage/useStorage'
import { env } from '@quickbot.io/env'

export const PreviewDrawer = () => {
  const { bot, save, isSavingLoading } = useBot()
  const { showPreviewDrawer, setShowPreviewDrawer } = useEditor()
  const { setPreviewingBlock } = useGraph()
  const { getPreferredRuntime, updatePreferredRuntime } = useStorage()
  const [restartKey, setRestartKey] = useState(0)

  const storedRuntime = getPreferredRuntime()
  const defaultRuntime = storedRuntime
    ? runtimes.find((runtime) => runtime.name === storedRuntime) ?? runtimes[0]
    : runtimes[0]

  const [selectedRuntime, setSelectedRuntime] = useState<(typeof runtimes)[number]>(defaultRuntime)

  const handleRestartClick = async () => {
    await save()
    setRestartKey((key) => key + 1)
  }

  const handleCloseClick = () => {
    setPreviewingBlock(undefined)
    setShowPreviewDrawer(false)
  }

  const setPreviewRuntimeAndSaveIntoLocalStorage = (runtime: (typeof runtimes)[number]) => {
    setSelectedRuntime(runtime)
    updatePreferredRuntime(runtime.name)
  }

  if (!showPreviewDrawer) return null

  return (
    <Flex
      pos="absolute"
      right="4"
      bottom="14"
      h="550px"
      bgColor="bg.dark"
      shadow="lg"
      zIndex={1500}
      width="400px"
      borderRadius="md"
      overflow="hidden"
    >
      <Box w="full" display="flex" flexDirection="column">
        <HStack
          justifyContent="space-between"
          w="full"
          px="20px"
          py="3"
          bg="green.500"
          color="white"
        >
          <Text>{bot?.name ?? ''} </Text>
          <HStack>
            {env.NEXT_PUBLIC_BETA_ENV && (
              <ClientDropdown
                selectedRuntime={selectedRuntime}
                onSelectRuntime={setPreviewRuntimeAndSaveIntoLocalStorage}
              />
            )}
            {selectedRuntime.name === 'Web' ? (
              <IconButton
                isRound={true}
                onClick={handleRestartClick}
                isLoading={isSavingLoading}
                variant="ghost"
                aria-label="Restart"
                fontSize="20px"
                color="currentColor"
                icon={<RepeatIcon />}
              />
            ) : null}
            <CloseButton onClick={handleCloseClick} />
          </HStack>
        </HStack>
        <PreviewDrawerBody key={restartKey} runtime={selectedRuntime.name} />
      </Box>
    </Flex>
  )
}
