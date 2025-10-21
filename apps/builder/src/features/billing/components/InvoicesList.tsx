import { DownloadIcon, FileIcon } from '@urbiport/icons'
import React from 'react'
import {
  Stack,
  Text,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  Button,
  Tag,
  TableContainer,
} from '@chakra-ui/react'
import { BoxCard, H2 } from '@urbiport/ui'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useToast } from '@urbiport/ui'
import { trpc } from '@/lib/trpc'
import { useTranslate } from '@tolgee/react'
import { formatPrice } from '@quickbot.io/billing/helpers/formatPrice'
import { TableSkeleton } from '@/components/TableSkeleton'

export const InvoicesList = () => {
  const { workspace } = useWorkspace()
  const { t } = useTranslate()
  const { showToast } = useToast()

  const { data, status } = trpc.billing.listInvoices.useQuery(
    {
      workspaceId: workspace ? workspace.id : '',
    },
    {
      enabled: !!workspace?.id,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
      onError: (error) => {
        showToast({
          detailsTitle: t('toast.details'),
          description: error.message,
        })
      },
    },
  )

  const isLoading = status === 'loading'

  const handleDownload = (invoiceDocument: string) => {
    window.open(invoiceDocument, '_blank')
  }

  return (
    <BoxCard>
      <Stack spacing="24px">
        <H2>{t('billing.invoices.label')}</H2>
        {data?.invoices.length === 0 && status !== 'loading' ? (
          <Text>{t('billing.invoices.empty')}</Text>
        ) : (
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>#</Th>
                  <Th>Date</Th>
                  <Th>Number</Th>
                  <Th>Payment Method</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data &&
                  data?.invoices?.map((invoice) => (
                    <Tr key={invoice.id}>
                      <Td>
                        <FileIcon color="text.light" />
                      </Td>
                      <Td>{invoice.date ? new Date(invoice.date * 1000).toDateString() : ''}</Td>
                      <Td>{invoice.id}</Td>
                      <Td>Stripe</Td>
                      <Td>
                        {formatPrice(invoice.amount / 100, {
                          currency: invoice.currency,
                          maxFractionDigits: 2,
                        })}
                      </Td>
                      <Td>
                        <Tag variant="gray">Paid</Tag>
                      </Td>
                      <Td>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleDownload(invoice.url)}
                          leftIcon={<DownloadIcon color="text.light" />}
                        >
                          Invoice
                        </Button>
                      </Td>
                    </Tr>
                  ))}

                {isLoading && <TableSkeleton rows={7} columns={7} />}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </Stack>
    </BoxCard>
  )
}
