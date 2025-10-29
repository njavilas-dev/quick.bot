import { Flex } from '@chakra-ui/react'
import { useBot } from '@/features/editor/providers/BotProvider'
import { BotNotFoundPage } from '@/features/editor/components/BotNotFoundPage'
import { BotHeaderMenu } from '@/features/editor/components/BotHeaderMenu'
import { FlowEditorView } from '@/components/FlowEditorView'
import { SidebarSlideProvider } from '@urbiport/ui'

export const ThemePage = () => {
  const { is404 } = useBot()

  if (is404) return <BotNotFoundPage />

  return (
    <Flex position="relative" overflow="hidden" h="100vh" flexDir="column">
      <SidebarSlideProvider>
        <BotHeaderMenu />
        <Flex h="full" w="full">
          <Flex flex="1" w="full">
            <FlowEditorView currentPage="theme" />
          </Flex>
        </Flex>
      </SidebarSlideProvider>
    </Flex>
  )
}
