import { streamingMessage } from '@/utils/streamingMessageSignal'
import { For, createEffect, createSignal } from 'solid-js'
import { marked } from 'marked'
import domPurify from 'dompurify'
import { isNotEmpty } from '@quickbot.io/lib'
import { persist } from '@/utils/persist'
import { BotContext } from '@/types'

type Props = {
  streamingMessageId: string
  context: BotContext
}

export const StreamingBubble = (props: Props) => {
  const [content, setContent] = persist(createSignal<string[]>([]), {
    key: `bot-streaming-message-${props.streamingMessageId}`,
    storage: props.context.storage,
  })

  marked.use({
    renderer: {
      link: (href, _title, text) => {
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
      },
    },
  })

  createEffect(() => {
    if (streamingMessage()?.id !== props.streamingMessageId) return []
    setContent(
      streamingMessage()
        ?.content.split('```')
        .map((block, index) => {
          if (index % 2 === 0) {
            return block.split('\n\n').map((line) =>
              domPurify.sanitize(
                marked.parse(line.replace(/【.+】/g, ''), {
                  breaks: true,
                }),
                {
                  ADD_ATTR: ['target'],
                },
              ),
            )
          } else {
            return [
              domPurify.sanitize(
                marked.parse('```' + block + '```', {
                  breaks: true,
                }),
                {
                  ADD_ATTR: ['target'],
                },
              ),
            ]
          }
        })
        .flat()
        .filter(isNotEmpty) ?? [],
    )
  })

  return (
    <div class="flex flex-col animate-fade-in">
      <div class="flex w-full items-center">
        <div class="flex relative items-start max-w-full bubble--host">
          <div
            class="flex items-center absolute px-4 py-2 transition-all duration-[400ms] ease-out bubble__typing"
            style={{
              width: '100%',
              height: '100%',
            }}
            data-testid="host-bubble"
          />
          <div
            class={
              'flex flex-col overflow-hidden quickbot__text--fade-in mx-4 my-3 relative text-ellipsis h-full gap-6 transition-opacity duration-[400ms] ease-in delay-200'
            }
          >
            <For each={content()}>{(line) => <span innerHTML={line} />}</For>
          </div>
        </div>
      </div>
    </div>
  )
}
