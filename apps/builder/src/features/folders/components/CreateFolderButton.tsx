import { Button, HStack, Text, Tooltip } from '@chakra-ui/react'
import { FolderPlusIcon, LockedIcon } from '@urbiport/icons'
import { useWorkspace } from '@/hooks/useWorkspace'
import React from 'react'
import { useTranslate } from '@tolgee/react'
import UpgradePlan from '@/features/billing/components/UpgradePlan'

type Props = { isLoading: boolean; onClick: () => void }

export const CreateFolderButton = ({ isLoading, onClick }: Props) => {
  const { t } = useTranslate()
  const { workspace } = useWorkspace()

  const handleClick = () => {
    onClick()
  }

  return (
    <>
      {!workspace?.billingPlan?.allowCustomDomain ? (
        <UpgradePlan
          trigger={({ onOpen }) => (
            <Tooltip label={t('billing.upgradeLimitLabel', { type: t('billing.limitMessage.folder') })}>
              <Button
                onClick={onOpen}
                leftIcon={<LockedIcon />}
                variant="outline"
                isLoading={isLoading}
              >
                {t('folders.createFolderButton.label')}
              </Button>
            </Tooltip>
          )}
        />
      ) : (
        <Button leftIcon={<FolderPlusIcon />} onClick={handleClick} isLoading={isLoading}>
          <HStack>
            <Text>{t('folders.createFolderButton.label')}</Text>
          </HStack>
        </Button>
      )}
    </>
  )
}
