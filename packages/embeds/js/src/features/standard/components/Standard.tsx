import '../../../assets/normalize.css'
import styles from '../../../assets/index.css'
import { Bot, BotProps } from '@/components/Bot'
import { createSignal, onMount, onCleanup, Show } from 'solid-js'
import { EnvironmentProvider } from '@ark-ui/solid'
import { useMessageListener } from '@/hooks/useMessageListener'

const hostElementCss = `
:host {
  display: block;
  width: 100%;
  height: 100%;
  overflow-y: hidden;
}
`

export const Standard = (props: BotProps, { element }: { element: HTMLElement }) => {
  const [isBotDisplayed, setIsBotDisplayed] = createSignal(false)

  const launchBot = () => {
    setIsBotDisplayed(true)
  }

  const botLauncherObserver = new IntersectionObserver((intersections) => {
    if (intersections.some((intersection) => intersection.isIntersecting)) launchBot()
  })

  //Mounted the listener for the isFromBot guard only.
  useMessageListener(() => {})

  onMount(() => {
    botLauncherObserver.observe(element)
  })

  onCleanup(() => {
    botLauncherObserver.disconnect()
  })

  return (
    <EnvironmentProvider value={document.querySelector('quickbot-standard')?.shadowRoot as Node}>
      <style>
        {styles}
        {hostElementCss}
      </style>
      <Show when={isBotDisplayed()}>
        <Bot {...props} />
      </Show>
    </EnvironmentProvider>
  )
}
