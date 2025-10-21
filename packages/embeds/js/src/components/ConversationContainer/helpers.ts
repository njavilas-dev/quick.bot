import { InputSubmitContent } from '@/types'
import { ContinueChatResponse, Message, Theme } from '@quickbot.io/schemas'

export const convertSubmitContentToMessage = (
  answer: InputSubmitContent | undefined,
): Message | undefined => {
  if (!answer) return
  if (answer.type === 'text')
    return {
      type: 'text',
      text: answer.value,
      attachedFileUrls: answer.attachments?.map((attachment) => attachment.url),
    }
  if (answer.type === 'recording') return { type: 'audio', url: answer.url }
}

export const autoScrollToBottom = (
  containerElement: HTMLDivElement | undefined,
  lastElement?: HTMLDivElement,
  offset = 0,
  autoScrollBottomToleranceScreenPercent = 0.6,
  bottomSpacerHeight = 128,
) => {
  if (!containerElement) return

  const bottomTolerance =
    containerElement.clientHeight * autoScrollBottomToleranceScreenPercent - bottomSpacerHeight

  const isBottomOfLastElementInView =
    containerElement.scrollTop + containerElement.clientHeight >=
    containerElement.scrollHeight - bottomTolerance

  if (isBottomOfLastElementInView) {
    setTimeout(() => {
      containerElement?.scrollTo(
        0,
        lastElement ? lastElement.offsetTop - offset : containerElement.scrollHeight,
      )
    }, 50)
  }
}

export const parseDynamicTheme = (
  initialTheme: Theme,
  dynamicTheme: ContinueChatResponse['dynamicTheme'],
): Theme => ({
  ...initialTheme,
  chat: {
    ...initialTheme.chat,
    hostAvatar:
      initialTheme.chat?.hostAvatar && dynamicTheme?.hostAvatarUrl
        ? {
            ...initialTheme.chat.hostAvatar,
            url: dynamicTheme.hostAvatarUrl,
          }
        : initialTheme.chat?.hostAvatar,
    guestAvatar:
      initialTheme.chat?.guestAvatar && dynamicTheme?.guestAvatarUrl
        ? {
            ...initialTheme.chat.guestAvatar,
            url: dynamicTheme?.guestAvatarUrl,
          }
        : initialTheme.chat?.guestAvatar,
  },
})
