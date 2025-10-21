import React from 'react'
import { EditorProvider } from '@/features/editor/providers/EditorProvider'
import { Flex, Spinner } from '@chakra-ui/react'
import { SuspectedBotBanner } from '@/features/editor/components/SuspectedBotBanner'
import { GraphDragAndDropProvider } from '@/features/graph/providers/GraphDragAndDropProvider'
import { GraphProvider } from '@/features/graph/providers/GraphProvider'
import { GraphZoomProvider } from '@/features/graph/providers/GraphZoomProvider'
import { FlowEventsCoordinatesProvider } from '@/features/graph/providers/FlowEventsCoordinatesProvider'
import { Graph } from '@/features/graph/components/Graph'
import { useBot } from '@/features/editor/providers/BotProvider'
import { useWorkspace } from '@/hooks/useWorkspace'
import { FlowSideMenu } from '@/features/editor/components/FlowSideMenu'
import { BotFooter } from '@/features/editor/components/BotFooter'
import { ThemeSideMenu } from '@/features/theme/components/ThemeSideMenu'
import { SettingsSideMenu } from '@/features/settings/components/SettingsSideMenu'
import { PreviewDrawer } from '@/features/preview/components/PreviewDrawer'

type FlowEditorViewProps = {
  currentPage: string
}

const FlowEditorContent = ({ currentPage }: FlowEditorViewProps) => {
  const { workspace } = useWorkspace()
  const { bot, currentUserMode } = useBot()

  const isSuspicious = bot?.riskLevel === 100 && !workspace?.isVerified

  return (
    <Flex overflow="clip" h="100vh" width={'100%'} flexDir="column" id="editor-container">
      {isSuspicious && <SuspectedBotBanner botId={bot.id} />}
      <Flex flex="1" pos="relative" h="full">
        {bot ? (
          <GraphDragAndDropProvider>
            {currentUserMode === 'write' && currentPage === 'flow' && <FlowSideMenu />}
            {currentUserMode === 'write' && currentPage === 'theme' && <ThemeSideMenu />}
            {currentUserMode === 'write' && currentPage === 'settings' && <SettingsSideMenu />}
            <GraphProvider isReadOnly={currentUserMode === 'read' || currentUserMode === 'guest'}>
              <FlowEventsCoordinatesProvider events={bot.events}>
                <Graph flex="1" bot={bot} key={bot.id} />
                <PreviewDrawer />
              </FlowEventsCoordinatesProvider>
              <BotFooter />
            </GraphProvider>
          </GraphDragAndDropProvider>
        ) : (
          <Flex justify="center" align="center" boxSize="full">
            <Spinner />
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}

export const FlowEditorView = ({ currentPage = '' }: FlowEditorViewProps) => {
  return (
    <EditorProvider>
      <GraphZoomProvider>
        <FlowEditorContent currentPage={currentPage} />
      </GraphZoomProvider>
    </EditorProvider>
  )
}
