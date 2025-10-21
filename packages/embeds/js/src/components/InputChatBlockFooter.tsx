import type {
  ContinueChatResponse,
  // ChoiceInputBlock,
  EmailInputBlock,
  FileInputBlock,
  NumberInputBlock,
  PhoneNumberInputBlock,
  RatingInputBlock,
  RuntimeOptions,
  TextInputBlock,
  Theme,
  UrlInputBlock,
  PaymentInputBlock,
  DateInputBlock,
} from '@quickbot.io/schemas'
import { BotContext, InputSubmitContent } from '@/types'
import { TextInputTest } from '@/features/blocks/inputs/textInput'
import { NumberInput } from '@/features/blocks/inputs/number'
import { EmailInput } from '@/features/blocks/inputs/email'
import { UrlInput } from '@/features/blocks/inputs/url'
import { PhoneInput } from '@/features/blocks/inputs/phone'
import { DateForm } from '@/features/blocks/inputs/date'
import { RatingForm } from '@/features/blocks/inputs/rating'
import { FileUploadForm } from '@/features/blocks/inputs/fileUpload'
import { createSignal, Switch, Match, createEffect, Show } from 'solid-js'
import { isNotDefined } from '@quickbot.io/lib'
import { isMobile } from '@/utils/isMobileSignal'
import { PaymentForm } from '@/features/blocks/inputs/payment'
import { formattedMessages } from '@/utils/formattedMessagesSignal'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { defaultPaymentInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/payment/constants'
import { persist } from '@/utils/persist'
import { useInputAnswer } from './InputAnswerContext'

type Props = {
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

export const InputChatBlockFooter = (props: Props) => {
  const { getAnswer, setAnswer } = useInputAnswer()

  const [localAnswer, setLocalAnswer] = persist(createSignal<InputSubmitContent>(), {
    key: `bot-${props.context.bot.id}-input-footer-${props.chunkIndex}`,
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
    // Only handle effects for text-based inputs (not choice)
    if (props.block.type === InputBlockType.CHOICE) {
      return
    }

    const formattedMessage = formattedMessages().findLast(
      (message) => props.chunkIndex === message.inputIndex,
    )?.formattedMessage
    if (formattedMessage && props.block.type !== InputBlockType.FILE) {
      const currentAnswer = getAnswer(props.chunkIndex)
      // Only update if the answer doesn't already have this label to prevent infinite loops
      if (currentAnswer?.type === 'text' && currentAnswer.label !== formattedMessage) {
        setLocalAnswer((answer) =>
          answer?.type === 'text' ? { ...answer, label: formattedMessage } : answer,
        )
        setAnswer(props.chunkIndex, { ...currentAnswer, label: formattedMessage })
      }
    }
  })

  return (
    <Switch>
      <Match when={isNotDefined(answer()) || props.hasError}>
        <div
          class="flex justify-end animate-fade-in gap-2 m-5 input__footer-container"
          data-blockid={props.block.id}
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

  const getPrefilledValue = () =>
    props.existingAnswer ?? (props.isInputPrefillEnabled ? props.block.prefilledValue : undefined)

  const submitPaymentSuccess = () =>
    props.onSubmit({
      type: 'text',
      value:
        (props.block.options as PaymentInputBlock['options'])?.labels?.success ??
        defaultPaymentInputOptions.labels.success,
    })

  return (
    <Switch>
      <Match when={props.block.type === InputBlockType.TEXT}>
        <TextInputTest
          block={props.block as TextInputBlock}
          defaultValue={getPrefilledValue()}
          context={props.context}
          onSubmit={onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.NUMBER}>
        <NumberInput
          block={props.block as NumberInputBlock}
          defaultValue={getPrefilledValue()}
          onSubmit={onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.EMAIL}>
        <EmailInput
          block={props.block as EmailInputBlock}
          defaultValue={getPrefilledValue()}
          onSubmit={onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.URL}>
        <UrlInput
          block={props.block as UrlInputBlock}
          defaultValue={getPrefilledValue()}
          onSubmit={onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.PHONE}>
        <PhoneInput
          labels={(props.block as PhoneNumberInputBlock).options?.labels}
          defaultCountryCode={(props.block as PhoneNumberInputBlock).options?.defaultCountryCode}
          defaultValue={getPrefilledValue()}
          onSubmit={onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.DATE}>
        <DateForm
          options={props.block.options as DateInputBlock['options']}
          defaultValue={getPrefilledValue()}
          onSubmit={onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.RATING}>
        <RatingForm
          block={props.block as RatingInputBlock}
          defaultValue={getPrefilledValue()}
          onSubmit={onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.FILE}>
        <FileUploadForm
          context={props.context}
          block={props.block as FileInputBlock}
          onSubmit={onSubmit}
          onSkip={props.onSkip}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.PAYMENT}>
        <PaymentForm
          context={props.context}
          options={
            {
              ...props.block.options,
              ...props.block.runtimeOptions,
            } as PaymentInputBlock['options'] & RuntimeOptions
          }
          onSuccess={submitPaymentSuccess}
          onTransitionEnd={props.onTransitionEnd}
        />
      </Match>
    </Switch>
  )
}
