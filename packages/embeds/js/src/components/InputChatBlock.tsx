import type {
  ContinueChatResponse,
  ChoiceInputBlock,
  Theme,
} from '@quickbot.io/schemas'
import { GuestBubble } from './bubbles/GuestBubble'
import { BotContext, InputSubmitContent } from '@/types'
import { createSignal, Switch, Match, createEffect, Show } from 'solid-js'
import { isNotDefined } from '@quickbot.io/lib'
import { isMobile } from '@/utils/isMobileSignal'
import { MultipleChoicesForm } from '@/features/blocks/inputs/buttons/components/MultipleChoicesForm'
import { Buttons } from '@/features/blocks/inputs/buttons/components/Buttons'
import { formattedMessages } from '@/utils/formattedMessagesSignal'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { persist } from '@/utils/persist'
import { defaultGuestAvatarIsEnabled } from '@quickbot.io/schemas/features/bot/theme/constants'
import { useInputAnswer } from './InputAnswerContext'

type Props = {
  ref: HTMLDivElement | undefined
  block: NonNullable<ContinueChatResponse['input']>
  hasHostAvatar: boolean
  guestAvatar?: NonNullable<Theme['chat']>['guestAvatar']
  chunkIndex: number
  context: BotContext
  isInputPrefillEnabled: boolean
  hasError: boolean
  onTransitionEnd: () => void
  onSubmit: (content: InputSubmitContent) => void
  onSkip: () => void
}

export const InputChatBlock = (props: Props) => {
  const { getAnswer, setAnswer } = useInputAnswer()

  const [localAnswer, setLocalAnswer] = persist(createSignal<InputSubmitContent>(), {
    key: `bot-${props.context.bot.id}-input-${props.chunkIndex}`,
    storage: props.context.storage,
  })

  const answer = () => getAnswer(props.chunkIndex)

  const handleSubmit = async (content: InputSubmitContent) => {
    setLocalAnswer(content)
    setAnswer(props.chunkIndex, content)
    props.onSubmit(content)
  }

  const handleSkip = (label: string) => {
    const skipContent = { type: 'text' as const, value: label }
    setLocalAnswer(skipContent)
    setAnswer(props.chunkIndex, skipContent)
    props.onSkip()
  }

  createEffect(() => {
    // Only handle effects for choice inputs
    if (props.block.type !== InputBlockType.CHOICE) {
      return
    }

    const formattedMessage = formattedMessages().findLast(
      (message) => props.chunkIndex === message.inputIndex,
    )?.formattedMessage
    if (formattedMessage) {
      const currentAnswer = getAnswer(props.chunkIndex)
      // Only update if the answer doesn't already have this label to prevent infinite loops
      // And don't override labels for image buttons that already have the correct label set
      if (currentAnswer?.type === 'text' && currentAnswer.label !== formattedMessage && !currentAnswer.label) {
        setLocalAnswer((answer) =>
          answer?.type === 'text' ? { ...answer, label: formattedMessage } : answer,
        )
        setAnswer(props.chunkIndex, { ...currentAnswer, label: formattedMessage })
      }
    }
  })

  return (
    <Switch>
      <Match when={answer() && !props.hasError}>
        <GuestBubble
          answer={answer()}
          showAvatar={props.guestAvatar?.isEnabled ?? defaultGuestAvatarIsEnabled}
          avatarSrc={props.guestAvatar?.url && props.guestAvatar.url}
          hasHostAvatar={props.hasHostAvatar}
        />
      </Match>
      <Match when={isNotDefined(answer()) || props.hasError}>
        <div
          class="flex justify-end animate-fade-in gap-2"
          data-blockid={props.block.id}
          ref={props.ref}
        >
          <Show when={props.hasHostAvatar}>
            <div
              class={'flex flex-shrink-0 items-center ' + (isMobile() ? 'w-6 h-6' : 'w-10 h-10')}
            />
          </Show>
          <Input
            context={props.context}
            block={props.block}
            chunkIndex={props.chunkIndex}
            isInputPrefillEnabled={props.isInputPrefillEnabled}
            existingAnswer={props.hasError ? getAnswerValue(localAnswer()!) : undefined}
            onTransitionEnd={props.onTransitionEnd}
            onSubmit={handleSubmit}
            onSkip={handleSkip}
          />
        </div>
      </Match>
    </Switch>
  )
}

const getAnswerValue = (answer?: InputSubmitContent) => {
  if (!answer) return
  return answer.type === 'text' ? answer.value : answer.url
}

const Input = (props: {
  context: BotContext
  block: NonNullable<ContinueChatResponse['input']>
  chunkIndex: number
  isInputPrefillEnabled: boolean
  existingAnswer?: string
  onTransitionEnd: () => void
  onSubmit: (answer: InputSubmitContent) => void
  onSkip: (label: string) => void
}) => {
  const onSubmit = (answer: InputSubmitContent) => props.onSubmit(answer)

  //TODO change names buttons to choice input
  return (
    <Switch>
      <Match when={isButtonsBlock(props.block)} keyed>
        {(block) => (
          <Switch>
            <Match when={!block.options?.isMultipleChoice}>
              <Buttons
                chunkIndex={props.chunkIndex}
                defaultItems={block.items}
                options={block.options}
                onSubmit={onSubmit}
                onTransitionEnd={props.onTransitionEnd}
              />
            </Match>
            <Match when={block.options?.isMultipleChoice}>
              <MultipleChoicesForm
                defaultItems={block.items}
                options={block.options}
                onSubmit={onSubmit}
                onTransitionEnd={props.onTransitionEnd}
              />
            </Match>
          </Switch>
        )}
      </Match>
    </Switch>
  )
}

const isButtonsBlock = (block: ContinueChatResponse['input']): ChoiceInputBlock | undefined =>
  block?.type === InputBlockType.CHOICE ? block : undefined
