import { Stack, Skeleton } from '@chakra-ui/react'
import { H4, Switch, useToast } from '@urbiport/ui'
import { FormControl } from '@urbiport/ui'
import { useTranslate } from '@tolgee/react'
import { useUser } from '@/hooks/useUser'
import { trpc } from '@/lib/trpc'
import { useEffect, useState } from 'react'
import { useLoadingSave } from '@/hooks/useLoadingSave'

export const AccountNotificationsForm = () => {
  const { t } = useTranslate()
  const { user } = useUser()
  const [isUpdating, setIsUpdating] = useState(false)
  const { showToast } = useToast()
  const setLoadingSave = useLoadingSave()
  const { mutate: updateAccountNotificationSetting, isLoading: isUpdatingNotificationSetting } =
    trpc.account.updateAccountNotificationSetting.useMutation({
      onMutate: () => setIsUpdating(true),
      onSettled: () => setIsUpdating(false),
      onError: (error) => {
        showToast({
          detailsTitle: t('toast.details'),
          description: error.message,
        })
      },
      onSuccess: () => {
        showToast({
          status: 'success',
          detailsTitle: t('toast.details'),
          description: t('settings.notifications.updatedDescription'),
        })
      },
    })

  const { data: notificationSetting, isLoading } =
    trpc.account.getAccountNotificationSetting.useQuery(undefined, {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
    })

  useEffect(() => {
    if (isUpdatingNotificationSetting) {
      setLoadingSave()
    }
  }, [isUpdatingNotificationSetting, setLoadingSave])

  return (
    <Stack spacing={6} maxWidth="600px">
      <H4>{t('settings.notifications.descriptionEmail.label', { email: user?.email })}</H4>
      {isLoading && (
        <Stack>
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
        </Stack>
      )}
      {!isLoading && notificationSetting && (
        <>
          <FormControl
            direction="row"
            isDisabled={isUpdating}
            label={t('settings.notifications.almostReachedChatsLimit.label')}
          >
            <Switch
              defaultValue={notificationSetting.almostReachedChatsLimit}
              onChange={(value) =>
                updateAccountNotificationSetting({ key: 'almostReachedChatsLimit', value })
              }
            />
          </FormControl>
          <FormControl direction="row" label={t('settings.notifications.reachedChatsLimit.label')}>
            <Switch
              defaultValue={notificationSetting.reachedChatsLimit}
              onChange={(value) => updateAccountNotificationSetting({ key: 'reachedChatsLimit', value })}
            />
          </FormControl>
          <FormControl direction="row" label={t('settings.notifications.botAnswersResult.label')}>
            <Switch
              defaultValue={notificationSetting.botAnswersResult}
              onChange={(value) => updateAccountNotificationSetting({ key: 'botAnswersResult', value })}
            />
          </FormControl>
        </>
      )}
    </Stack>
  )
}
