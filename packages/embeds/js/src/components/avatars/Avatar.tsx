import { createEffect, createSignal, Show } from 'solid-js'
import { isMobile } from '@/utils/isMobileSignal'
import { isNotEmpty } from '@quickbot.io/lib'
import { AvatarPlaceholder } from './AvatarPlaceholder'

export const Avatar = (props: { initialAvatarSrc?: string }) => {
  const [avatarSrc, setAvatarSrc] = createSignal(props.initialAvatarSrc)

  createEffect(() => {
    if (
      (avatarSrc()?.startsWith('{{') || !avatarSrc()) &&
      props.initialAvatarSrc?.startsWith('http')
    )
      setAvatarSrc(props.initialAvatarSrc)
  })

  return (
    <figure
      class={
        'flex justify-center items-center rounded-full text-white relative animate-fade-in flex-shrink-0 ' +
        (isMobile() ? 'w-6 h-6 text-sm' : 'w-10 h-10 text-xl')
      }
    >
      <Show when={isNotEmpty(avatarSrc())} keyed fallback={<AvatarPlaceholder />}>
        <img
          src={avatarSrc()}
          alt="Bot avatar"
          class="rounded-full object-cover w-full h-full"
          elementtiming={'Bot avatar'}
          fetchpriority={'high'}
        />
      </Show>
    </figure >
  )
}
