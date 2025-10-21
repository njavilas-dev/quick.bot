import { SubmitButton } from '@/components/SubmitButton'
import { InputSubmitContent } from '@/types'
import { isMobile } from '@/utils/isMobileSignal'
import { ChoiceInputBlock } from '@quickbot.io/schemas'
import { createSignal, createEffect, For, Match, onMount, Show, Switch } from 'solid-js'
import { Checkbox } from './Checkbox'
import { SearchInput } from '@/components/inputs/SearchInput'
import { defaultChoiceInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/choice/constants'
import { isDefined, isEmpty, isNotEmpty, isSvgSrc } from '@quickbot.io/lib'

type Props = {
  defaultItems: ChoiceInputBlock['items']
  options: ChoiceInputBlock['options']
  onSubmit: (value: InputSubmitContent) => void
  onTransitionEnd: () => void
}

export const MultipleChoicesForm = (props: Props) => {
  let inputRef: HTMLInputElement | undefined
  const [filteredItems, setFilteredItems] = createSignal(props.defaultItems)
  const [selectedItemIds, setSelectedItemIds] = createSignal<string[]>([])
  const [totalLoadedImages, setTotalLoadedImages] = createSignal(0)

  onMount(() => {
    if (!isMobile() && inputRef) inputRef.focus({ preventScroll: true })
  })

  const handleClick = (itemId: string) => {
    toggleSelectedItemId(itemId)
  }

  const toggleSelectedItemId = (itemId: string) => {
    const existingIndex = selectedItemIds().indexOf(itemId)
    if (existingIndex !== -1) {
      setSelectedItemIds((selectedItemIds) =>
        selectedItemIds.filter((selectedItemId) => selectedItemId !== itemId),
      )
    } else {
      setSelectedItemIds((selectedIndices) => [...selectedIndices, itemId])
    }
  }

  const handleSubmit = () =>
    props.onSubmit({
      type: 'text',
      value: selectedItemIds()
        .map((selectedItemId) => {
          const item = props.defaultItems.find((it) => it.id === selectedItemId)
          if (!item) return ''
          if (item.pictureSrc) {
            return isNotEmpty(item.title) ? item.title : item.pictureSrc
          }
          return item.content
        })
        .join(', '),
    })

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
        return item.content?.toLowerCase().includes(query)
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
    <form class="flex flex-col items-end gap-2 w-full" onSubmit={handleSubmit}>
      <Show when={props.options?.isSearchable}>
        <div class="flex items-end input w-full h-full transition-all duration-100">
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
                <div
                  role="checkbox"
                  aria-checked={selectedItemIds().some(
                    (selectedItemId) => selectedItemId === item.id,
                  )}
                  on:click={() => handleClick(item.id)}
                  class={
                    'flex flex-col focus:outline-none cursor-pointer select-none w-[236px] transition-all duration-300 border button--picture-selectable' +
                    (selectedItemIds().some((selectedItemId) => selectedItemId === item.id)
                      ? ' button--selected'
                      : '') +
                    (isSvgSrc(item.pictureSrc) ? ' button--has-svg' : '')
                  }
                  data-itemid={item.id}
                >
                  <img
                    src={item.pictureSrc}
                    alt={item.title ?? `Picture ${index() + 1}`}
                    elementtiming={`Picture choice ${index() + 1}`}
                    fetchpriority={'high'}
                    class="m-auto"
                    onLoad={onImageLoad}
                  />
                  <div
                    class={
                      'flex gap-3 py-2 flex-shrink-0' +
                      (isEmpty(item.title) && isEmpty(item.description)
                        ? ' justify-center'
                        : ' px-3')
                    }
                  >
                    <Checkbox
                      isChecked={selectedItemIds().some(
                        (selectedItemId) => selectedItemId === item.id,
                      )}
                      class={
                        'flex-shrink-0' + (item.title || item.description ? ' mt-1' : undefined)
                      }
                    />
                    <Show when={item.title || item.description}>
                      <div class="flex flex-col gap-1 ">
                        <Show when={item.title}>
                          <span class="font-normal">{item.title}</span>
                        </Show>
                        <Show when={item.description}>
                          <span class="text-sm whitespace-pre-wrap text-left">
                            {item.description}
                          </span>
                        </Show>
                      </div>
                    </Show>
                  </div>
                </div>
              </Match>
              <Match when={!item.pictureSrc}>
                <span class={'relative' + (isMobile() ? ' w-full' : '')}>
                  <div
                    role="checkbox"
                    aria-checked={selectedItemIds().some(
                      (selectedItemId) => selectedItemId === item.id,
                    )}
                    on:click={() => handleClick(item.id)}
                    class={
                      'w-full py-2 px-4 font-normal focus:outline-none cursor-pointer select-none transition-all duration-300 button--selectable' +
                      (selectedItemIds().some((selectedItemId) => selectedItemId === item.id)
                        ? ' button--selected'
                        : '')
                    }
                    data-itemid={item.id}
                  >
                    <div class="flex items-center gap-2">
                      <Checkbox
                        isChecked={selectedItemIds().some(
                          (selectedItemId) => selectedItemId === item.id,
                        )}
                        class="flex-shrink-0"
                      />
                      <span>{item.content}</span>
                    </div>
                  </div>
                </span>
              </Match>
            </Switch>
          )}
        </For>
        <For
          each={selectedItemIds()
            .filter((selectedItemId) => filteredItems().every((item) => item.id !== selectedItemId))
            .map((selectedItemId) => props.defaultItems.find((item) => item.id === selectedItemId))
            .filter(isDefined)}
        >
          {(selectedItem, index) => (
            <Switch>
              <Match when={!!selectedItem.pictureSrc}>
                <div
                  role="checkbox"
                  aria-checked
                  onClick={() => handleClick(selectedItem.id)}
                  class="flex flex-col cursor-pointer select-none w-[236px] transition-all duration-300 border button--picture-selectable button--selected "
                  data-itemid={selectedItem.id}
                >
                  <img
                    src={selectedItem.pictureSrc}
                    alt={selectedItem.title ?? `Selected picture ${index() + 1}`}
                  />
                  <div class="flex gap-3 py-2 flex-shrink-0">
                    <Checkbox isChecked={selectedItemIds().includes(selectedItem.id)} />
                    <Show when={selectedItem.title || selectedItem.description}>
                      <div class="flex flex-col gap-1">
                        <Show when={selectedItem.title}>
                          <span class="font-normal">{selectedItem.title}</span>
                        </Show>
                        <Show when={selectedItem.description}>
                          <span class="text-sm whitespace-pre-wrap text-left">
                            {selectedItem.description}
                          </span>
                        </Show>
                      </div>
                    </Show>
                  </div>
                </div>
              </Match>

              <Match when={!selectedItem.pictureSrc}>
                <span class={'relative' + (isMobile() ? ' w-full' : '')}>
                  <div
                    role="checkbox"
                    aria-checked
                    onClick={() => handleClick(selectedItem.id)}
                    class="w-full py-2 px-4 font-normal cursor-pointer select-none button--selected transition-all duration-300 button--selectable"
                    data-itemid={selectedItem.id}
                  >
                    <div class="flex items-center gap-2">
                      <Checkbox isChecked />
                      <span>{selectedItem.content}</span>
                    </div>
                  </div>
                </span>
              </Match>
            </Switch>
          )}
        </For>
      </div>
      {selectedItemIds().length > 0 && (
        <SubmitButton>
          {props.options?.buttonLabel ?? defaultChoiceInputOptions.buttonLabel}
        </SubmitButton>
      )}
    </form>
  )
}
