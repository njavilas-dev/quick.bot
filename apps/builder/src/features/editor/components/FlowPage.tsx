import { Flex } from '@chakra-ui/react'
import { useBot } from '@/features/editor/providers/BotProvider'
import { BotNotFoundPage } from '@/features/editor/components/BotNotFoundPage'
import { FlowEditorView } from '@/components/FlowEditorView'
import { SidebarSlideProvider } from '@urbiport/ui'
import { BotHeaderMenu } from '@/features/editor/components/BotHeaderMenu'
import { useRouter } from 'next/router'

export const FlowPage = () => {
  const { is404 } = useBot()

  const router = useRouter()

  const isIframe = router.asPath.endsWith('/iframe')

  if (is404) return <BotNotFoundPage />

  return (
    <Flex position="relative" overflow="hidden" h="100vh" flexDir="column">
      <SidebarSlideProvider>
        {!isIframe && <BotHeaderMenu />}
        <Flex h="full" w="full">
          <Flex flex="1" w="full">
            <FlowEditorView currentPage="flow" />
          </Flex>
        </Flex>
      </SidebarSlideProvider>
    </Flex>
  )
}
