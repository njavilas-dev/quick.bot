import { InputTextWithVariables } from '@/components/inputs'
import { useBot } from '@/features/editor/providers/BotProvider'
import { useToast } from '@urbiport/ui'
import { trpc } from '@/lib/trpc'
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  HStack,
  Link,
  SlideFade,
  Stack,
  StackProps,
  Text,
} from '@chakra-ui/react'
import { isEmpty } from '@quickbot.io/lib'
import { FormEvent, useState } from 'react'
import {
  getPhoneNumberFromLocalStorage,
  setPhoneNumberInLocalStorage,
} from '../helpers/phoneNumberFromLocalStorage'
import { useEditor } from '@/features/editor/providers/EditorProvider'
import { ExternalLinkIcon } from '@urbiport/icons'
import { useTranslate } from '@tolgee/react'
import { FormControl } from '@urbiport/ui'
import { TextLink } from '@/components/TextLink'

export const PreviewWhatsApp = (props: StackProps) => {
  const { t } = useTranslate()
  const { bot, save } = useBot()
  const { startPreviewAtGroup, startPreviewAtEvent } = useEditor()
  const [phoneNumber, setPhoneNumber] = useState(getPhoneNumberFromLocalStorage() ?? '')
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [isMessageSent, setIsMessageSent] = useState(false)
  const [hasMessageBeenSent, setHasMessageBeenSent] = useState(false)

  const { showToast } = useToast()
  const { mutate } = trpc.whatsApp.startWhatsAppPreview.useMutation({
    onMutate: () => setIsSendingMessage(true),
    onSettled: () => setIsSendingMessage(false),
    onError: (error) => {
      showToast({
        detailsTitle: t('toast.details'),
        description: error.message,
      })
    },
    onSuccess: async (data) => {
      if (data?.message === 'success' && phoneNumber !== getPhoneNumberFromLocalStorage())
        setPhoneNumberInLocalStorage(phoneNumber)
      setHasMessageBeenSent(true)
      setIsMessageSent(true)
      setTimeout(() => setIsMessageSent(false), 30000)
    },
  })

  const sendWhatsAppPreviewStartMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (!bot) return
    await save()
    mutate({
      to: phoneNumber,
      botId: bot.id,
      startFrom: startPreviewAtGroup
        ? { type: 'group', groupId: startPreviewAtGroup }
        : startPreviewAtEvent
          ? { type: 'event', eventId: startPreviewAtEvent }
          : undefined,
    })
  }

  return (
    <Stack
      as="form"
      spacing={4}
      overflowY="auto"
      w="full"
      h="full"
      px="20px"
      py="40px"
      pb="20px"
      onSubmit={sendWhatsAppPreviewStartMessage}
      {...props}
    >
      <FormControl label="Your phone number">
        <InputTextWithVariables
          placeholder="+XXXXXXXXXXXX"
          type="tel"

          defaultValue={phoneNumber}
          onChange={setPhoneNumber}
        />
      </FormControl>
      {!isMessageSent && (
        <Button
          isDisabled={isEmpty(phoneNumber) || isMessageSent}
          isLoading={isSendingMessage}
          type="submit"
          colorScheme="blue"
        >
          {hasMessageBeenSent ? 'Restart' : 'Start'} the chat
        </Button>
      )}
      <SlideFade offsetY="20px" in={isMessageSent} unmountOnExit>
        <Stack>
          <Button
            as={Link}
            href={`https://web.whatsapp.com/`}
            isExternal
            colorScheme="blue"
            rightIcon={<ExternalLinkIcon />}
          >
            Open WhatsApp Web
          </Button>
          <Alert status="success">
            <HStack>
              <AlertIcon />
              <Stack spacing={1}>
                <Text fontWeight="semibold">Chat started!</Text>
                <Text fontSize="sm">The first message can take up to 2 min to be delivered.</Text>
              </Stack>
            </HStack>
          </Alert>
        </Stack>
      </SlideFade>
      <Box mt="auto">
        <Text fontSize="sm" pl="1">
          {t('blocks.integrations.apiPreviewInstructions.checkApiReference')}{' '}
          <TextLink href="https://docs.quick.bot/builder/deploy/whatsapp" isExternal>
            {t('blocks.integrations.apiPreviewInstructions.apiReference')}
          </TextLink>{' '}
          {t('blocks.integrations.apiPreviewInstructions.moreInformation')}
        </Text>
      </Box>
    </Stack>
  )
}
