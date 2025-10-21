import React, { useState } from 'react'
import { Alert, AlertIcon, Flex, Stack } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { BoxCard, H2 } from '@urbiport/ui'
import { isDefined } from '@quickbot.io/lib'
import { SidebarSlideConsumer, SidebarSlideProvider } from '@urbiport/ui'
import { SIDEBAR_WIDTH } from '@/features/editor/constants'
import { useBot } from '@/features/editor/providers/BotProvider'
import { BotNotFoundPage } from '@/features/editor/components/BotNotFoundPage'
import { BotFloatHeader } from '@/features/editor/components/BotFloatHeader'
import { parseDefaultPublicId } from '../helpers/parseDefaultPublicId'
import { DeploySideMenu } from './DeploySideMenu'
import { integrationsList } from './embeds/integrationsList'
import { parseApiHost } from './embeds/snippetParsers'

export const DeployPage = () => {
  const { bot, publishedBot, is404 } = useBot()
  const [selectedIntegration, setSelectedIntegration] = useState<number>(0)

  const { t } = useTranslate()

  const generatedPublicId: string = bot ? bot.publicId ?? parseDefaultPublicId(bot.name, bot.id) : ''
  const isPublished = isDefined(publishedBot)

  if (is404) return <BotNotFoundPage />

  const handleIntegrationClick = (index: number) => {
    setSelectedIntegration((prev) => (prev === index ? prev : index))
  }

  const apiHost = parseApiHost(bot?.customDomain)

  return (
    <Flex position="relative" overflow="hidden" h="100vh" flexDir="column">
      <SidebarSlideProvider>
        <SidebarSlideConsumer>
          {({ isExtended }) => (
            <>
              <BotFloatHeader />
              <Flex h="full" w="full">
                <Flex flex="1" w="full">
                  <Flex overflow="clip" h="100vh" width={'100%'} flexDir="column">
                    <Flex
                      flex="1"
                      pos="relative"
                      h="full"
                      bgColor="bg.dark"
                      justifyContent="flex-end"
                    >
                      <DeploySideMenu
                        selectedIndex={selectedIntegration}
                        onSelect={handleIntegrationClick}
                      />
                      <Flex
                        flexBasis={`calc(100% - ${isExtended ? SIDEBAR_WIDTH : 0}px)`}
                        transition="flex-basis 350ms cubic-bezier(0.075, 0.82, 0.165, 1) 0s"
                        overflow="hidden"
                        maxWidth="100%"
                      >
                        <Stack w="full" spacing={4} p={6} pt={20}>
                          <H2>
                            {integrationsList[selectedIntegration]?.label ?? 'Deploy your bot'}
                          </H2>
                          {selectedIntegration !== -1 && (
                            <BoxCard overflow="auto">
                              {!isPublished &&
                                <Alert status="error" mb="4">
                                  <AlertIcon />
                                  {t('publish.apiModal.notPublished')}
                                </Alert>
                              }
                              {React.createElement(integrationsList[selectedIntegration].modal, {
                                publicId: generatedPublicId,
                                isPublished,
                                apiHost,
                                isOpen: true,
                                onClose: () => setSelectedIntegration(-1),
                              })}
                            </BoxCard>
                          )}
                        </Stack>
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            </>
          )}
        </SidebarSlideConsumer>
      </SidebarSlideProvider>
    </Flex>
  )
}
