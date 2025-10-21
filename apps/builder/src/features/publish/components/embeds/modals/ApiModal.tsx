import {
  OrderedList,
  ListItem,
  Code,
  Text,
} from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { FormControl } from '@urbiport/ui'
import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { TextLink } from '@/components/TextLink'
import { ModalProps } from '../EmbedButton'

export const ApiModalContent = ({ publicId, apiHost }: ModalProps): JSX.Element => {
  const { t } = useTranslate()

  return (
    <>
      <OrderedList spacing={4} pl="4">
        <ListItem>
          <FormControl
            label={
              <>
                {t('publish.apiModal.startChat')} <Code>POST</Code>{' '}
                {t('publish.apiModal.requestTo')}
              </>
            }
          >
            <CodeEditorWithVariables
              isReadOnly
              lang={'shell'}
              defaultValue={`${apiHost}/api/v1/bots/${publicId}/startChat`}
            />
          </FormControl>
        </ListItem>
        <ListItem>{t('publish.apiModal.firstResponse')}</ListItem>
        <ListItem>
          <FormControl
            label={
              <>
                {t('publish.apiModal.sendReplies')} <Code>POST</Code>{' '}
                {t('publish.apiModal.requestsTo')}
              </>
            }
          >
            <CodeEditorWithVariables
              isReadOnly
              lang={'shell'}
              defaultValue={`${apiHost}/api/v1/sessions/<ID_FROM_FIRST_RESPONSE>/continueChat`}
            />
          </FormControl>
          <FormControl
            label={t('publish.apiModal.jsonReplyBody')}
            helperText={t('publish.apiModal.replaceSessionId')}
          >
            <CodeEditorWithVariables
              isReadOnly
              lang={'json'}
              defaultValue={`{
                "message": "This is my reply"
              }`}
            />
          </FormControl>
        </ListItem>
      </OrderedList>
      <Text fontSize="sm" color="text.light">
        {t('publish.apiModal.checkApiReference')}{' '}
        <TextLink href="https://docs.quick.bot/api/chat/start-chat" isExternal>
          {t('publish.apiModal.apiReference')}
        </TextLink>{' '}
        {t('publish.apiModal.moreInformation')}
      </Text>
    </>
  )
}
