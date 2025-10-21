import { onCleanup, onMount } from 'solid-js'
import { LogoIcon } from './icons/LogoIcon'

type Props = {
  botContainer: HTMLDivElement | undefined
}

export const LiteBadge = (props: Props) => {
  let liteBadge: HTMLAnchorElement | undefined
  let observer: MutationObserver | undefined

  const appendBadgeIfNecessary = (mutations: MutationRecord[]) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((removedNode) => {
        if ('id' in removedNode && liteBadge && removedNode.id == 'lite-badge') {
          console.log("Sorry, you can't remove the brand 😅")
          props.botContainer?.append(liteBadge)
        }
      })
    })
  }

  onMount(() => {
    if (!document || !props.botContainer) return
    observer = new MutationObserver(appendBadgeIfNecessary)
    observer.observe(props.botContainer, {
      subtree: false,
      childList: true,
    })
  })

  onCleanup(() => {
    if (observer) observer.disconnect()
  })

  return (
    <a
      ref={liteBadge}
      href={'https://quick.bot/?utm_source=litebadge'}
      target="_blank"
      rel="noopener noreferrer"
      class="!p-3 !bg-black/[0.04] !z-50 !border-t !border-black/[0.08] !text-black/60 !gap-2 !text-xs !leading-3 !h-10 !font-normal !opacity-100 !visible !flex !items-center !justify-center !no-underline hover:!bg-[#f7f8ff] [&_svg]:!w-4 [&_svg]:!h-4"
      id="lite-badge"
    >
      <LogoIcon />
      <span>Powered by quick.bot</span>
    </a>
  )
}
