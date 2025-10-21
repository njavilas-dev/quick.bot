import { Theme } from '@quickbot.io/schemas'
import { Show } from 'solid-js'
import { LoadingBubble } from '../bubbles/LoadingBubble'
import { AvatarSideContainer } from './AvatarSideContainer'
import { defaultHostAvatarIsEnabled } from '@quickbot.io/schemas/features/bot/theme/constants'

type Props = {
  theme: Theme
}

export const LoadingChunk = (props: Props) => (
  <div class="flex w-full">
    <div class="flex flex-col w-full min-w-0">
      <div class="flex gap-2">
        <Show when={props.theme.chat?.hostAvatar?.isEnabled ?? defaultHostAvatarIsEnabled}>
          <AvatarSideContainer hostAvatarSrc={props.theme.chat?.hostAvatar?.url} />
        </Show>
        <LoadingBubble />
      </div>
    </div>
  </div>
)
