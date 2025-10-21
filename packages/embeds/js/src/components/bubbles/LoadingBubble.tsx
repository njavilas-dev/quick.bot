import { TypingBubble } from '@/components'

export const LoadingBubble = () => (
  <div class="flex flex-col animate-fade-in">
    <div class="flex w-full items-center">
      <div class={'flex relative items-start bubble--host'}>
        <div
          class="flex items-center absolute px-4 py-2  transition-all duration-[400ms] ease-out bubble__typing"
          style={{
            width: '64px',
            height: '32px',
          }}
          data-testid="host-bubble"
        >
          <TypingBubble />
        </div>
        <p
          class={
            'overflow-hidden quickbot__text--fade-in mx-4 my-3 whitespace-pre-wrap slate-html-container relative opacity-0 h-6 text-ellipsis transition-opacity duration-[400ms] ease-in delay-200'
          }
        />
      </div>
    </div>
  </div>
)
