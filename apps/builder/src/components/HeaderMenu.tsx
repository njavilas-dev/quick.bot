import React from 'react'
import { HStack, Flex, Button } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { AccountDropdown } from '@/features/account/components/AccountDropdown'
import UpgradePlan from '@/features/billing/components/UpgradePlan'
import { Breadcrumbs } from './Breadcrumbs'

export const HeaderMenu = () => {
  const { t } = useTranslate()
  return (
    <Flex w="100%" justify="space-between" align="center">
      <Breadcrumbs />
      <HStack spacing={4}>
        <UpgradePlan
          trigger={({ onOpen }) => (
            <Button onClick={onOpen} colorScheme="teal" variant="solid">
              {t('upgrade').toUpperCase()}
            </Button>
          )}
        />
        <AccountDropdown />
      </HStack>
    </Flex>
  )
}
