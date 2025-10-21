import { fetchLinkedBots } from './fetchLinkedBots'

type Props = {
  parentBotIds: string[]
  userId: string | undefined
  isPreview?: boolean
}

export const fetchLinkedParentBots = ({ parentBotIds, isPreview, userId }: Props) =>
  parentBotIds.length > 0
    ? fetchLinkedBots({
        botIds: parentBotIds,
        isPreview,
        userId,
      })
    : []
