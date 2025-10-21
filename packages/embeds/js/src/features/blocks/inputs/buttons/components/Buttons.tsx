import { Button } from '@/components/Button'
import { SearchInput } from '@/components/inputs/SearchInput'
import { InputSubmitContent } from '@/types'
import { isMobile } from '@/utils/isMobileSignal'
import type { ChoiceInputBlock } from '@quickbot.io/schemas'
import { For, Match, Show, Switch, createSignal, onMount, createEffect } from 'solid-js'
import { defaultChoiceInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/choice/constants'
import { isSvgSrc, isDefined, isNotEmpty } from '@quickbot.io/lib'

type Props = {
  chunkIndex: number
  defaultItems: ChoiceInputBlock['items']
  options: ChoiceInputBlock['options']
  onSubmit: (value: InputSubmitContent) => void
  onTransitionEnd: () => void
}

export const Buttons = (props: Props) => {
  let inputRef: HTMLInputElement | undefined
  const [filteredItems, setFilteredItems] = createSignal(props.defaultItems)
  const [totalLoadedImages, setTotalLoadedImages] = createSignal(0)

  onMount(() => {
    if (!isMobile() && inputRef) inputRef.focus({ preventScroll: true })
  })

  const handleClick = (itemIndex: number) => {
    const item = filteredItems()[itemIndex]
    if (!item) return

    if (item.pictureSrc) {
      return props.onSubmit({
        type: 'text',
        label: isNotEmpty(item.title) ? item.title : item.pictureSrc ?? item.id,
        value: item.id,
      })
    }

    return props.onSubmit({
      type: 'text',
      label: item.content ?? '',
      value: item.value ?? item.content ?? item.id,
    })
  }

  const filterItems = (inputValue: string) => {
    const query = (inputValue ?? '').toLowerCase()
    setFilteredItems(
      props.defaultItems.filter((item) => {
        if (item.pictureSrc) {
          return (
            item.title?.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query)
          )
        }
        return (
          item.content?.toLowerCase().includes(query) || item.title?.toLowerCase().includes(query)
        )
      }),
    )
  }

  createEffect(() => {
    if (
      totalLoadedImages() === props.defaultItems.filter((item) => isDefined(item.pictureSrc)).length
    )
      props.onTransitionEnd()
  })

  const onImageLoad = () => {
    setTotalLoadedImages((acc) => acc + 1)
  }

  return (
    <div class="flex flex-col gap-2 w-full">
      <Show when={props.options?.isSearchable}>
        <div class="flex items-end input w-full">
          <SearchInput
            ref={inputRef}
            onInput={filterItems}
            placeholder={
              props.options?.searchInputPlaceholder ??
              defaultChoiceInputOptions.searchInputPlaceholder
            }
            onClear={() => setFilteredItems(props.defaultItems)}
          />
        </div>
      </Show>

      <div
        class={
          'flex flex-wrap justify-end gap-2' +
          (props.options?.isSearchable ? ' overflow-y-scroll max-h-80 rounded-md' : '')
        }
      >
        <For each={filteredItems()}>
          {(item, index) => (
            <Switch>
              <Match when={!!item.pictureSrc}>
                <button
                  on:click={() => handleClick(index())}
                  data-itemid={item.id}
                  class={
                    'flex flex-col focus:outline-none filter hover:brightness-90 active:brightness-75 justify-between w-[236px] transition-all duration-300 button--picture' +
                    (isSvgSrc(item.pictureSrc) ? 'button--has-svg' : '')
                  }
                >
                  <img
                    src={item.pictureSrc}
                    alt={item.title ?? `Picture ${index() + 1}`}
                    elementtiming={`Picture choice ${index() + 1}`}
                    fetchpriority={'high'}
                    class="m-auto min-w-[200px] w-full max-h-[200px] h-full object-cover rounded-t-[var(--quickbot-button-border-radius)]"
                    onLoad={onImageLoad}
                  />
                  <div
                    class={
                      'flex flex-col gap-1 py-2 flex-shrink-0 px-4 w-full' +
                      (item.description ? ' items-start' : '')
                    }
                  >
                    <span class="font-normal">{item.title}</span>
                    <span class="text-sm whitespace-pre-wrap text-left">{item.description}</span>
                  </div>
                </button>
              </Match>
              <Match when={!item.pictureSrc}>
                <span class={'relative' + (isMobile() ? ' w-full' : '')}>
                  <Button
                    on:click={() => handleClick(index())}
                    data-itemid={item.id}
                    class="w-full"
                  >
                    {item.title || item.content}
                  </Button>
                  {props.chunkIndex === 0 && props.defaultItems.length === 1 && (
                    <span class="flex h-3 w-3 absolute top-0 right-0 -mt-1 -mr-1 ping">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full brightness-200 opacity-75" />
                      <span class="relative inline-flex rounded-full h-3 w-3 brightness-150" />
                    </span>
                  )}
                </span>
              </Match>
            </Switch>
          )}
        </For>
      </div>
    </div>
  )
}
