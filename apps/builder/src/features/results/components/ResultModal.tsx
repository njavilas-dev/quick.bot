import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Stack,
  HStack,
  Text,
} from '@chakra-ui/react'
import { useResults } from '../ResultsProvider'
import React from 'react'
import { byId, isDefined } from '@quickbot.io/lib'
import { ResultsTableColumnIcon } from './table/ResultsTableColumnIcon'
import { useBot } from '@/features/editor/providers/BotProvider'
import { parseColumnsOrder } from '@quickbot.io/results/parseColumnsOrder'
import { H4 } from '@urbiport/ui'

type Props = {
  resultId: string | null
  onClose: () => void
}

export const ResultModal = ({ resultId, onClose }: Props) => {
  const { tableData, resultHeader } = useResults()
  const { bot } = useBot()
  const result = isDefined(resultId)
    ? tableData.find((data) => data.id.plainText === resultId)
    : undefined

  const columnsOrder = parseColumnsOrder(bot?.resultsTablePreferences?.columnsOrder, resultHeader)

  const getHeaderValue = (val: string | { plainText: string; element?: JSX.Element | undefined }) =>
    typeof val === 'string' ? val : val.element ?? val.plainText

  return (
    <Modal isOpen={isDefined(result)} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody as={Stack} p="10" spacing="10">
          {columnsOrder.map((headerId) => {
            if (!result || !result[headerId]) return null
            const header = resultHeader.find(byId(headerId))
            if (!header) return null
            return (
              <Stack key={header.id} spacing="4">
                <HStack>
                  <ResultsTableColumnIcon header={header} />
                  <H4>{header.label}</H4>
                </HStack>
                <Text whiteSpace="pre-wrap" textAlign="justify">
                  {getHeaderValue(result[header.id])}
                </Text>
              </Stack>
            )
          })}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
