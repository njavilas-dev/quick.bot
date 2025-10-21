import { ThunderIcon } from '@urbiport/icons'
import { useUser } from '@/hooks/useUser'
import { useEditor } from '@/features/editor/providers/EditorProvider'
import { useBot } from '@/features/editor/providers/BotProvider'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { useToast } from '@urbiport/ui'
import { Standard } from '@urbiport/nextjs'
import { ContinueChatResponse } from '@quickbot.io/schemas'
import { useTranslate } from '@tolgee/react'

export const PreviewWeb = () => {
  const { t } = useTranslate()
  const { user } = useUser()
  const { bot } = useBot()
  const { startPreviewAtGroup, startPreviewAtEvent } = useEditor()
  const { setPreviewingBlock } = useGraph()

  const { showToast } = useToast()

  const handleNewLogs = (logs: ContinueChatResponse['logs']) => {
    logs?.forEach((log) => {
      showToast({
        detailsTitle: t('toast.details'),
        icon: <ThunderIcon />,
        status: log.status as 'success' | 'error' | 'info',
        title: log.status === 'error' ? 'An error occured' : undefined,
        description: log.description,
        details: log.details
          ? {
            lang: 'json',
            content:
              typeof log.details === 'string'
                ? log.details
                : JSON.stringify(log.details, null, 2),
          }
          : undefined,
      })
      if (log.status === 'error') console.error(log)
    })
  }

  if (!bot) return null

  return (
    <Standard
      key={`web-preview${startPreviewAtGroup ?? ''}${startPreviewAtEvent ?? ''}`}
      bot={bot}
      sessionId={user ? `${bot.id}-${user.id}` : undefined}
      startFrom={
        startPreviewAtGroup
          ? { type: 'group', groupId: startPreviewAtGroup }
          : startPreviewAtEvent
            ? { type: 'event', eventId: startPreviewAtEvent }
            : undefined
      }
      onNewInputBlock={(block) =>
        setPreviewingBlock({
          id: block.id,
          groupId: bot.groups.find((g) => g.blocks.some((b) => b.id === block.id))?.id ?? '',
        })
      }
      onNewLogs={handleNewLogs}
      style={{
        borderBottomLeftRadius: 'sm',
        borderBottomRightRadius: 'sm',
      }}
    />
  )
}
