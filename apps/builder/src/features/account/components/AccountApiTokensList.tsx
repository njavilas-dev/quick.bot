import {
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Button,
  Text,
  Stack,
  Flex,
  useDisclosure,
} from '@chakra-ui/react'
import { ConfirmModal } from '@/components/ConfirmModal'
import { useToast } from '@urbiport/ui'
import { User } from '@quickbot.io/prisma'
import React, { useEffect, useState } from 'react'
import { byId, isDefined } from '@quickbot.io/lib'
import { AccountApiTokensModal } from './AccountApiTokensModal'
import { deleteApiTokenQuery } from '../queries/deleteApiTokenQuery'
import { T, useTranslate } from '@tolgee/react'
import { TimeSince } from '@/components/TimeSince'
import { TableSkeleton } from '@/components/TableSkeleton'
import { UserApiToken } from '@quickbot.io/schemas'
import { trpc } from '@/lib/trpc'

type Props = { user: User }

export const AccountApiTokensList = ({ user }: Props) => {
  const { t } = useTranslate()
  const { showToast } = useToast()

  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()
  const [deletingId, setDeletingId] = useState<string>()

  const [userApiTokens, setUserApiTokens] = useState<UserApiToken[]>([])

  const {
    data,
    isSuccess,
    isLoading,
    refetch: refetchUserApiToken,
  } = trpc.account.getAccountApiTokens.useQuery(
    {
      userId: user.id,
    },
    {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
      onError: (error) => {
        showToast({
          detailsTitle: t('toast.details'),
          title: 'Failed to fetch tokens',
          description: error.message,
        })
      },
    },
  )

  useEffect(() => {
    if (isSuccess && data) {
      setUserApiTokens(data.userApiTokens)
    }
  }, [isSuccess, data])

  const refreshListWithNewToken = () => {
    if (!userApiTokens) return
    refetchUserApiToken()
  }

  const deleteToken = async (tokenId?: string) => {
    if (!userApiTokens || !tokenId) return
    const { error } = await deleteApiTokenQuery({ userId: user.id, tokenId })
    if (!error) refetchUserApiToken()
  }

  return (
    <Stack spacing={4}>
      <Flex justifyContent="flex-end">
        <Button onClick={onCreateOpen}>{t('account.apiTokens.createButton.label')}</Button>
        <AccountApiTokensModal
          userId={user.id}
          isOpen={isCreateOpen}
          onNewToken={refreshListWithNewToken}
          onClose={onCreateClose}
        />
      </Flex>

      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>{t('account.apiTokens.table.nameHeader')}</Th>
              <Th w="130px">{t('account.apiTokens.table.createdHeader')}</Th>
              <Th w="0" />
            </Tr>
          </Thead>
          <Tbody>
            {userApiTokens?.map((token) => (
              <Tr key={token.id}>
                <Td>{token.name}</Td>
                <Td>
                  <TimeSince date={token.createdAt.toDateString()} />
                </Td>
                <Td>
                  <Button size="xs" variant="outline:error" onClick={() => setDeletingId(token.id)}>
                    {t('account.apiTokens.deleteButton.label')}
                  </Button>
                </Td>
              </Tr>
            ))}
            {isLoading && <TableSkeleton columns={3} />}
          </Tbody>
        </Table>
      </TableContainer>
      <ConfirmModal
        isOpen={isDefined(deletingId)}
        onConfirm={() => deleteToken(deletingId)}
        onReject={() => setDeletingId(undefined)}
        message={
          <Text>
            <T
              keyName="account.apiTokens.deleteConfirmationMessage"
              params={{
                strong: <strong>{userApiTokens?.find(byId(deletingId))?.name}</strong>,
              }}
            />
          </Text>
        }
        confirmButtonLabel={t('account.apiTokens.deleteButton.label')}
      />
    </Stack>
  )
}
