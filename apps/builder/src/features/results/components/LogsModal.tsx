import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Stack,
  Spinner,
  ModalFooter,
  Accordion,
  AccordionItem,
  AccordionButton,
  HStack,
  AccordionIcon,
  AccordionPanel,
  Text,
  Tag,
} from '@chakra-ui/react'
import { BotLog } from '@quickbot.io/prisma'
import { isDefined } from '@quickbot.io/lib'
import { useLogs } from '../hooks/useLogs'
import { useTranslate } from '@tolgee/react'

type Props = {
  botId: string
  resultId: string | null
  onClose: () => void
}
export const LogsModal = ({ botId, resultId, onClose }: Props) => {
  const { isLoading, logs } = useLogs(botId, resultId)
  const { t } = useTranslate()

  return (
    <Modal isOpen={isDefined(resultId)} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('results.logsModal.logs')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody as={Stack}>
          {logs?.map((log, idx) => (
            <LogCard key={idx} log={log} />
          ))}
          {isLoading && <Spinner />}
          {!isLoading && (logs ?? []).length === 0 && (
            <Text>{t('results.logsModal.logsNotFound')}</Text>
          )}
        </ModalBody>

        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}

const LogCard = ({ log }: { log: BotLog }) => {
  if (log.details)
    return (
      <Accordion allowToggle>
        <AccordionItem>
          <AccordionButton>
            <HStack>
              <StatusTag status={log.status} />
              <Text>{log.description}</Text>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel as="pre" overflow="auto" borderWidth="1px" borderRadius="md">
            {log.details}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    )
  return (
    <HStack p="4">
      <StatusTag status={log.status} />
      <Text>{log.description}</Text>
    </HStack>
  )
}

const StatusTag = ({ status }: { status: string }) => {
  const { t } = useTranslate()

  switch (status) {
    case 'error':
      return <Tag variant={'statusRed'}>{t('results.StatusTag.fail')}</Tag>
    case 'warning':
      return <Tag variant={'colorScheme'}>{t('results.StatusTag.warn')}</Tag>
    case 'info':
      return <Tag variant={'statusBlue'}>{t('results.StatusTag.info')}</Tag>
    default:
      return <Tag variant={'statusGreen'}>{t('results.StatusTag.ok')}</Tag>
  }
}
