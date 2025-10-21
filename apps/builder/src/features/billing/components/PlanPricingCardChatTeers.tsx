import React, { useMemo } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Stack,
  ModalFooter,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  ModalHeader,
  Tooltip,
  useDisclosure,
  Tag,
} from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { formatPrice } from '@quickbot.io/billing/helpers/formatPrice'
import { ChatStripeTier } from '@quickbot.io/schemas'

type Props = {
  planChatTiers: ChatStripeTier[]
}

export const PlanPricingCardChatTeers = ({ planChatTiers }: Props): JSX.Element => {
  const { t } = useTranslate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const info: string =
    'A chat is counted whenever a user starts a discussion. It is independant of the number of messages he sends and receives.'

  const chatTiers = useMemo(() => {
    if (!planChatTiers) return []
    return [...planChatTiers].sort((a, b) => {
      if (a.upTo === null) return 1
      if (b.upTo === null) return -1
      return a.upTo - b.upTo
    })
  }, [planChatTiers])

  return (
    <>
      {t('billing.pricingCard.tierExtraChat')}{' '}
      <Tooltip label={info} cursor={'pointer'}>
        <Tag onClick={onOpen} cursor={'pointer'}>
          See tiers
        </Tag>
      </Tooltip>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent minWidth="fit-content" overflow="hidden" shadow="xl">
          <ModalHeader>{t('billing.tiersModal.heading')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody as={Stack} py={4} px={6} pb={0}>
            <TableContainer overflowY="auto" maxHeight="40vh">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Max</Th>
                    <Th>$/Month</Th>
                    <Th>$/1000</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {chatTiers.map((tier, index) => {
                    const pricePerMonth =
                      (tier.flatAmount ?? chatTiers.at(-2)?.flatAmount ?? 0) / 100
                    return (
                      <Tr key={tier.upTo}>
                        <Td>{tier.isInfinite ? '2,000,000+' : tier.upTo!.toLocaleString()}</Td>
                        <Td>{index === 0 ? 'included' : formatPrice(pricePerMonth)}</Td>
                        <Td>
                          {index === chatTiers.length - 1
                            ? formatPrice(4.42, { maxFractionDigits: 2 })
                            : index === 0
                            ? 'included'
                            : formatPrice(
                                (((pricePerMonth * 100) /
                                  ((tier.upTo as number) - (chatTiers.at(0)?.upTo as number))) *
                                  1000) /
                                  100,
                                { maxFractionDigits: 2 },
                              )}
                        </Td>
                      </Tr>
                    )
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    </>
  )
}
